### Foundation roadmap (free-form 2D web game)

This document describes **how we’ll build the foundations** for a simple browser-based 2D game in **phases**. Each phase is designed to become a concrete implementation plan later.

**Target proof-of-concept by the end of this roadmap**
- **Move around** a free-form 2D space (keyboard)
- **Collide** with walls/obstacles
- **Interact** with NPCs (proximity + “press to interact”)
- **Change scenes** (walk through a door/trigger into a new area)

**Design goal**
- Keep the foundation **simple and shippable**, but structured so we can start building **story/content** (NPC dialogue, triggers, quests) without refactoring core architecture.

---

### Tech choices (recommended for simplicity)
- **Engine**: **Phaser 3** (Canvas/WebGL, mature, easy scenes + collisions)
- **Physics**: start with **Arcade Physics**
  - **Why**: fastest to implement for AABB-style collisions and “overlap zones” (interactions/doors).
  - **When we’d switch to Matter**: if we need rotated bodies, complex polygon collisions, or more “physical” behaviors.
- **Build tooling**: **Vite** + **TypeScript**
  - **Why**: simplest modern dev loop and clean structure; TS helps keep entity/scene APIs stable as story grows.
- **Content format (for story readiness)**: simple **JSON scene manifests**
  - Even if we prototype by hardcoding, the foundation should converge to data-driven scenes quickly.

---

### Locked decisions (from your answers)
- **Movement**: instant 4-direction (Zelda-like), gridless
- **Controls**: arrow keys only
- **Interact**: press **E** (not automatic on overlap)
- **Camera**: fixed screen per scene (no scrolling camera)
- **Scene transitions**: press interact at a door/exit trigger
- **Collisions**: rectangles only (super simple)
- **Dialogue**: linear (no branching) for the foundation

---

### Architectural principles (so story is easy later)
- **Scenes are the unit of world composition**: each “area” is a Phaser `Scene` that loads a manifest describing walls, NPCs, doors, and spawn points.
- **Entities own behavior, scenes own orchestration**:
  - `Player` handles movement + facing + interaction intent
  - `Npc` defines interaction prompt + dialogue trigger
  - `DoorTrigger` defines destination scene + destination spawn id
- **Interactions are not collisions**:
  - Use **overlap zones** for “talk”/“enter door”
  - Colliders are reserved for **solid** obstacles
- **Game state is explicit**:
  - A small `GameState` object (or Phaser `registry`) stores persistent state (flags, inventory later, last spawn, etc.)
- **Events over tight coupling**:
  - Use a small event bus (or Phaser events) to communicate: dialogue opened/closed, scene transition requested, quest flag set, etc.

---

### Phase 0 — Project skeleton + dev loop
**Goal**: Make it easy to iterate quickly and keep the codebase organized for expansion.

**Deliverables**
- Vite + TS project booting a Phaser game to a canvas
- A minimal folder layout (suggested):
  - `src/engine/` (core helpers: input, events, state)
  - `src/scenes/` (Boot/Preload + world scenes)
  - `src/entities/` (Player, NPC, triggers)
  - `src/content/` (scene manifests, dialogue scripts later)
  - `public/assets/` (sprites, audio)
- Boot → Preload → World flow (with a loading screen)

**Acceptance criteria**
- Running dev server shows a blank world scene (background color is fine) with no console errors.

**Notes**
- Avoid over-engineering here; we just need “clean rails” for the next phases.

---

### Phase 1 — Player movement (free-form) + camera
**Goal**: A controllable character that feels good to move.

**Deliverables**
- Player entity with:
  - Arrow keys (or WASD) to move in 4 directions
  - Diagonal movement normalized (no faster diagonals)
  - Idle vs walking animation state (even placeholder)
  - “Facing direction” tracked (needed for interactions)
- Camera follows player with a small deadzone or smoothing (optional)
- World bounds (so you can’t walk off into infinity)

**Acceptance criteria**
- Player moves smoothly, with consistent speed in all directions.
- Fixed-screen rules are in place (player stays on the same screen; if we add camera later it’s a planned change).

**Story hook**
- Player has a stable “facing” concept so dialogue/interaction prompts can feel intentional.

---

### Phase 2 — Collision foundation (walls/obstacles)
**Goal**: Solid obstacles you can’t walk through.

**Approach (simple, free-form)**
- Represent walls/obstacles as **static physics bodies**:
  - Start with rectangles (quickest)
  - Later allow polygons if needed (still manageable, but more setup)

**Deliverables**
- Collision groups/layers:
  - `player` (dynamic body)
  - `solids` (static bodies)
- Collision response:
  - Player slides along walls naturally (Arcade collider)
- Debug draw toggle (hitboxes) for faster iteration

**Acceptance criteria**
- Player cannot pass through obstacles from any direction.
- No jittering/sticking on corners in typical movement.

**Story hook**
- “Blocked paths” become a reliable tool for pacing and gating.

---

### Phase 3 — Interaction system (NPCs + prompts)
**Goal**: Player can interact with NPCs reliably (not by bumping).

**Approach (best-practice for simplicity)**
- Each interactable has:
  - A visible sprite (NPC)
  - An invisible **interaction zone** (overlap)
  - Metadata: `interactionId`, optional `dialogueId`
- Interaction flow:
  - When player overlaps zone: show prompt “Press E”
  - On `E` press: trigger interaction callback
  - While in dialogue: movement input is disabled (or reduced) to avoid chaos

**Deliverables**
- `Interactable` interface (or base class) with:
  - `getPromptText()`
  - `canInteract(player)`
  - `interact(player, gameState)`
- Minimal dialogue UI:
  - Single text box overlay with “advance” button/key
  - Can be placeholder text; the important part is the plumbing

**Acceptance criteria**
- Player can approach an NPC, see a prompt, press interact, and see dialogue.
- Interaction does not accidentally trigger from far away or through walls (within reason).

**Story hook**
- Dialogue/UI pipeline exists, enabling us to author story content immediately afterward.

---

### Phase 4 — Scene transitions (doors/portals) + spawn points
**Goal**: Multiple connected areas with clean transitions.

**Approach**
- Doors are overlap zones (not colliders) with:
  - `toSceneKey`
  - `toSpawnId`
- Scene transition is **press-to-interact**:
  - On overlap: show prompt “Press E”
  - On `E`: transition
- Transitions use camera fades (optional but feels polished):
  - Fade out → switch scene → place player at spawn → fade in

**Deliverables**
- At least 2 world scenes:
  - Scene A: player + walls + one NPC + one door
  - Scene B: player + different layout + (optional) NPC
- A standard scene API:
  - `init({ spawnId })` to decide spawn placement
  - `create()` loads scene manifest

**Acceptance criteria**
- Walking into a door trigger reliably loads a new scene.
- Player appears at the correct spawn point.
- No duplicated UI or stuck input state after transitions.

**Story hook**
- We can structure story as “chapters/locations” and gate progress via scene graph.

---

### Phase 5 — Content pipeline (story-ready foundation)
**Goal**: Stop hardcoding and make the world extensible via content files.

**Deliverables**
- **Scene manifest** format (JSON) that supports:
  - `sceneKey`
  - `spawns[]` (id + position)
  - `solids[]` (rects/polys)
  - `npcs[]` (id + sprite + position + zone + dialogueId)
  - `doors[]` (rect zone + toSceneKey + toSpawnId)
- Dialogue content format:
  - Start simple: `{ dialogueId: { lines: [...] } }`
  - Expand later to branching choices and flags
- Basic game flags in `GameState`:
  - `flags: Record<string, boolean>`
  - Minimal helpers: `setFlag`, `hasFlag`

**Acceptance criteria**
- Adding a new NPC/door/wall can be done by editing JSON, not code.

**Story hook**
- This is the handoff point: you can build story by authoring **dialogue + triggers + flags**.

---

### Phase 6 — “Foundation complete” PoC checklist
By the end of Phase 5, we should be able to demo:
- **Movement**: smooth top-down control
- **Collisions**: walls block movement
- **NPC interaction**: prompt + dialogue UI + advancing lines
- **Scene changes**: door trigger + spawn placement
- **Extensibility**: add content (NPC/door/wall/dialogue) with data files

---

### Art pipeline notes (iPad → game assets)
You said you’ll draw art on an iPad. A simple, low-risk pipeline:
- **Export format**: PNG with transparency (for sprites, UI), PNG/JPG (for full backgrounds)
- **Consistency**: keep a consistent “world scale” early (e.g., player is always ~N pixels tall)
- **Avoid blur**:
  - If you’re doing pixel art: keep integer scaling and disable smoothing in the renderer
  - If you’re doing non-pixel art: export at higher resolution than needed and scale down consistently
- **Animation**: prefer separate frames (PNGs) that we later pack into an atlas/spritesheet
- **Packing**: use a spritesheet/atlas packer later (Phaser loads texture atlases efficiently)

---

### Optional Phase 7 — Online multiplayer MVP (2 players)
**Is it possible?** Yes—totally doable in a browser game, but it adds meaningful complexity.

**What “simple multiplayer” usually means**
- A small **authoritative server** (Node.js) that:
  - accepts player connections
  - receives player input (up/down/left/right, interact)
  - simulates movement + collisions
  - broadcasts positions/state back to clients

**Simplest tech options**
- **Colyseus** (game-focused rooms + state sync): `https://docs.colyseus.io/tutorial/phaser`
- **Socket.IO** (general realtime events; you build more yourself): `https://phaser.io/news/2019/03/creating-a-multiplayer-phaser-3-game-tutorial`

**MVP scope (keep it sane)**
- 2 players in the **same scene**
- Sync only:
  - player position + facing + current animation (idle/walk)
  - which NPC dialogue is currently open (**shared**)
- No matchmaking system beyond “join room by link/code” (no accounts)
- No anti-cheat beyond server-authoritative movement (good enough for friends)

**Key design changes to support multiplayer cleanly**
- Make movement **input-driven** (clients send inputs; server simulates)
- Make interactions deterministic:
  - server decides “you can interact with NPC X now”
  - server triggers dialogue start event
- Keep scene transitions simple:
  - everyone transitions together (since players always share the same scene)

**Concrete multiplayer MVP design (so we can plan it)**
- **Topology**
  - Single **global room** for the whole server
  - Exactly **2 players max** in the room (3rd connection rejected)
  - Both players are always in the same scene
- **Hosting**
  - Frontend: Vercel (Phaser client)
  - Backend: separate Node host that supports WebSockets (Colyseus/Socket.IO)
- **Tick + sync**
  - Server runs a fixed tick (e.g., 20–30 Hz)
  - Clients send only **inputs** (held directions + `E` press)
  - Server simulates:
    - movement (instant 4-dir)
    - rectangle collisions
    - interaction eligibility (player near NPC/door trigger)
  - Server broadcasts state:
    - both players’ positions/facing/anim state
    - dialogue state (who is talking to which NPC + current line index)
    - scene state (current sceneKey + spawn if transitioning)
- **Dialogue UX**
  - Dialogue UI appears for both players (shared)
  - Players are **not forced to pause**; movement can continue during dialogue
- **Client smoothing**
  - Client interpolates remote player positions between server updates (simple lerp)
  - Local player can be “server authoritative” only (simplest) or add prediction later if needed

**How hard is it? (honest estimate)**
- If single-player foundation is done: multiplayer is commonly **~2–4×** the engineering effort for the same features, because of:
  - server setup + hosting
  - networking + serialization
  - smoothing (interpolation) to hide latency
  - edge cases (disconnects, rejoin, desync bugs)

**Acceptance criteria**
- Two players can connect from different networks, see each other moving, and collisions feel “mostly right”.
- No major desync after 2–3 minutes of play.

---

### Multiplayer clarifying questions (only if you want MP soon)
**Locked decisions**
- **Player count**: 2
- **Togetherness**: always the same scene
- **Hosting**: Vercel frontend + separate multiplayer server host
- **Join flow**: invite-by-link / room code only
- **Dialogue**: shared/synced between both players
- **Rooms**: single global room (max 2 connections total)
- **Dialogue UX**: shared UI, but players may keep moving

**Hosting note (Vercel)**
- Vercel is great for hosting the **client** (your Phaser game), but **real-time WebSocket servers** usually need a separate host that supports long-lived connections.
- Practical setup: **Vercel for the frontend + separate Node host for the multiplayer server** (Colyseus/Socket.IO).

**Remaining questions**
- None right now—multiplayer constraints are locked.


