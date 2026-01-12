# Scene Creation Workflow

**Date:** January 12, 2026  
**Version:** 1.0

This document provides the complete protocol for creating new scenes in the game, from initial design in the editor through integration into the game client, including connecting scenes and adding custom elements.

---

## Table of Contents

1. [Overview](#overview)
2. [Phase 1: Design in Editor](#phase-1-design-in-editor)
3. [Phase 2: Export & Asset Management](#phase-2-export--asset-management)
4. [Phase 3: Scene Integration](#phase-3-scene-integration)
5. [Phase 4: Custom Elements](#phase-4-custom-elements)
6. [Phase 5: Testing](#phase-5-testing)
7. [Appendix: JSON Format Reference](#appendix-json-format-reference)

---

## Overview

### The Scene Creation Pipeline

```
iPad/Art → Editor (Web) → Export JSON → Copy Assets → Create Scene Class → Add Dialogues → Test
```

### Key Concepts

- **Scenes are self-contained** - Each scene has its own JSON manifest
- **Scenes connect via Doors** - Doors define transitions between scenes
- **Spawns define entry points** - Each door targets a specific spawn ID in the destination scene
- **Assets are referenced, not embedded** - Sprites are loaded via registry, not stored in JSON
- **Custom elements require code** - Special items like collectibles need manual scene class additions

---

## Phase 1: Design in Editor

### 1.1 Create New Scene

1. Open `editor/index.html` in browser
2. Click **"New"** to start fresh canvas
3. Use **Scene Settings** panel to configure:
   - Scene name (descriptive, user-facing)
   - Background color (hex format: `0x2a2a4e`)
   - **Intro Message** (optional): Text shown on first visit, use `~` for page breaks

### 1.2 Place Core Elements

**Tool Order (recommended):**

1. **Wall Tool** - Define boundaries and obstacles
   - Click and drag to create rectangular collision boxes
   - Create perimeter walls first, then interior obstacles
   - Remember: walls are invisible in-game, they only block movement

2. **Spawn Tool** - Set player entry points
   - Place at least one spawn with ID `"default"` (used for scene initialization)
   - Add named spawns for each door connection (e.g., `"fromVillage"`, `"fromForest"`)
   - Position spawns slightly away from walls to avoid spawn-trapping

3. **Door Tool** - Create scene transitions
   - Place where players should exit/enter
   - Leave `toSceneKey` and `toSpawnId` blank for now (will fill after creating connected scene)
   - Set descriptive `promptText` (e.g., "Press E to enter forest")

4. **NPC Tool** - Add interactive characters
   - Place where you want NPCs to stand
   - Give each NPC a unique ID (e.g., `"elder"`, `"shopkeeper"`)
   - Leave dialogue ID blank initially (will add after writing dialogue)
   - Click **"Upload Sprite PNG"** to add custom sprite from iPad

5. **Enemy Tool** - Add hazards and threats
   - Choose behavior type:
     - **patrol**: Moves back and forth between spawn position (Point A) and Point B
     - **chase**: Pursues player when within range
     - **hazard**: Stationary danger zone
   - Set speed (80 for patrol, 120 for chase, 0 for hazard)
   - For patrol enemies: click **"Set Point B"** then click canvas to set patrol endpoint
   - Upload enemy sprite PNG (can use same sprite for multiple enemies)

### 1.3 Upload Sprites

For each NPC/Enemy:
1. Select entity with **Select Tool**
2. In properties panel, click **"Upload Sprite PNG"**
3. Choose PNG file from iPad/local storage
4. See sprite render immediately on canvas (editor preview)
5. Note the generated `spriteKey` (based on filename)

### 1.4 Export Scene

1. Click **"Export JSON"** button
2. Alert window shows:
   - Complete scene JSON (copy to clipboard)
   - List of sprites used with their filenames
   - Instructions for next steps
3. Save JSON content for next phase

**Example Export Alert:**
```
Scene JSON copied to clipboard!

Sprites used in this scene:
- villager_01.png (key: villager_01)
- slime.png (key: slime)

Next steps:
1. Copy sprite files to: client/public/assets/sprites/
2. Update client/public/assets/sprites/registry.json
3. Create or update scene JSON in client/public/data/scenes/
```

---

## Phase 2: Export & Asset Management

### 2.1 Copy Sprite Files

```bash
# From your iPad/asset source, copy PNG files to:
/client/public/assets/sprites/

# Example:
client/public/assets/sprites/
  ├── villager_01.png
  ├── slime.png
  ├── guard.png
  └── ...
```

### 2.2 Update Sprite Registry

Edit `/client/public/assets/sprites/registry.json`:

```json
{
  "comment": "Sprite registry: maps spriteKey to filename for dynamic loading",
  "sprites": {
    "player_1": "player_1.png",
    "player_2": "player_2.png",
    "villager_01": "villager_01.png",
    "slime": "slime.png",
    "guard": "guard.png"
  }
}
```

**Rules:**
- Add one entry per sprite file
- `spriteKey` must match what's in the scene JSON
- Filename is the actual PNG filename in the sprites directory
- Don't duplicate keys

### 2.3 Save Scene Manifest

Create new file in `/client/public/data/scenes/`:

```bash
# Naming convention: lowercase scene name + "scene.json"
/client/public/data/scenes/villagescene.json
/client/public/data/scenes/forestscene.json
/client/public/data/scenes/cavescene.json
```

Paste the exported JSON from editor, then **manually edit**:
- Set `"sceneKey"` to the exact TypeScript class name (e.g., `"VillageScene"`)
- Verify `"name"` is user-friendly (shown in debug display)
- Update door connections (see Phase 3)

---

## Phase 3: Scene Integration

### 3.1 Connect Scenes with Doors

Scenes connect bidirectionally using doors and spawns. You must plan both scenes before setting up connections.

**Example: Connecting Village ↔ Forest**

**Step 1: Plan the connection**
- Village has a door at bottom (y: 560) → leads to Forest
- Forest needs a spawn at top (y: 50) to receive player from Village
- Forest has a door at top (y: 50) → leads back to Village
- Village needs a spawn at bottom (y: 520) to receive player from Forest

**Step 2: Update villagescene.json**
```json
{
  "spawns": [
    {
      "id": "default",
      "x": 400,
      "y": 300
    },
    {
      "id": "fromForest",     // ← Spawn for returning from Forest
      "x": 400,
      "y": 520,
      "facing": "up"           // ← Optional: player faces up when spawning
    }
  ],
  "doors": [
    {
      "x": 400,
      "y": 560,
      "toSceneKey": "ForestScene",      // ← Destination scene class name
      "toSpawnId": "fromVillage",       // ← Destination spawn ID
      "promptText": "Press E to enter forest"
    }
  ]
}
```

**Step 3: Update forestscene.json**
```json
{
  "spawns": [
    {
      "id": "default",
      "x": 400,
      "y": 300
    },
    {
      "id": "fromVillage",    // ← Spawn for coming from Village
      "x": 400,
      "y": 50,
      "facing": "down"         // ← Player faces down when spawning
    }
  ],
  "doors": [
    {
      "x": 400,
      "y": 50,
      "toSceneKey": "VillageScene",     // ← Back to Village
      "toSpawnId": "fromForest",        // ← Village spawn ID
      "promptText": "Press E to return to village"
    }
  ]
}
```

**Key Rules:**
- Door's `toSpawnId` must exist in destination scene's `spawns` array
- Use descriptive spawn IDs that indicate origin: `"fromVillage"`, `"fromCave"`, etc.
- `toSceneKey` must exactly match the scene class name (case-sensitive)
- Position door and spawn appropriately so player doesn't immediately re-trigger door

### 3.2 Create Scene Class

Create new TypeScript file in `/client/src/scenes/`:

```typescript
// client/src/scenes/CaveScene.ts

import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Wall } from '../entities/Wall';
import { Npc } from '../entities/Npc';
import { Door } from '../entities/Door';
import { Enemy } from '../entities/Enemy';
import { SceneLoader } from '../systems/SceneLoader';
import { InputManager } from '../engine/InputManager';
import { DebugDisplay } from '../engine/DebugDisplay';
import { DebugDraw } from '../engine/DebugDraw';
import { PlaceholderGraphics } from '../engine/PlaceholderGraphics';
import { DialogueManager } from '../systems/DialogueManager';
import { GameState } from '../systems/GameState';
import { SceneManifest, EnemyData } from '../types';

export class CaveScene extends Phaser.Scene {
  private player!: Player;
  private walls: Wall[] = [];
  private npcs: Npc[] = [];
  private doors: Door[] = [];
  private enemies: Enemy[] = [];
  private inputManager!: InputManager;
  private debugDisplay!: DebugDisplay;
  private debugDraw!: DebugDraw;
  private dialogueManager!: DialogueManager;
  private isPlayerDead: boolean = false;
  
  private spawnId: string = 'default'; // Will be overridden by scene data
  
  // Track visited scenes for intro messages
  static visitedScenes: Set<string> = new Set();

  constructor() {
    super({ key: 'CaveScene' }); // ← Must match sceneKey in JSON
  }

  init(data: { spawnId?: string; previousScene?: string }) {
    this.spawnId = data.spawnId || 'default';
    console.log(`[CaveScene] init with spawn: ${this.spawnId}`);
  }

  create() {
    // Load scene manifest
    const manifest: SceneManifest = this.cache.json.get('cavescene');
    
    // Set background color
    this.cameras.main.setBackgroundColor(manifest.backgroundColor || 0x1a1a1a);
    
    // Create placeholder textures
    PlaceholderGraphics.createNpcTexture(this);
    PlaceholderGraphics.createEnemyTexture(this);

    // Find spawn point
    const spawn = manifest.spawns.find(s => s.id === this.spawnId) || manifest.spawns[0];
    
    // Create player
    this.player = new Player(this, spawn.x, spawn.y);
    if (spawn.facing) {
      this.player.setFacing(spawn.facing as 'up' | 'down' | 'left' | 'right');
    }

    // Create walls
    this.walls = SceneLoader.createWalls(this, manifest.walls);

    // Create NPCs
    this.npcs = SceneLoader.createNpcs(this, manifest.npcs);

    // Create doors
    this.doors = SceneLoader.createDoors(this, manifest.doors);

    // Create enemies
    if (manifest.enemies) {
      this.enemies = SceneLoader.createEnemies(this, manifest.enemies, this.player);
    }

    // Setup collisions
    this.physics.add.collider(this.player, this.walls);
    this.physics.add.overlap(this.player, this.npcs);
    this.physics.add.overlap(this.player, this.doors);
    if (this.enemies.length > 0) {
      this.physics.add.overlap(
        this.player,
        this.enemies,
        this.handlePlayerDeath,
        undefined,
        this
      );
    }

    // Initialize systems
    this.inputManager = new InputManager(this);
    this.debugDisplay = new DebugDisplay(this);
    this.debugDraw = new DebugDraw(this);
    this.dialogueManager = DialogueManager.getInstance(this);

    // Show intro message if first visit
    if (manifest.introMessage && !CaveScene.visitedScenes.has('CaveScene')) {
      CaveScene.visitedScenes.add('CaveScene');
      this.showIntroMessage(manifest.introMessage);
    }

    // Camera follow player
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1);
  }

  update(time: number, delta: number) {
    if (this.isPlayerDead) return;

    // Update player
    this.player.update(time, delta, this.inputManager);

    // Update enemies
    for (const enemy of this.enemies) {
      enemy.update(this.player);
    }

    // Update dialogue manager
    this.dialogueManager.update(this.inputManager);

    // Check interactions (NPCs and Doors)
    if (this.inputManager.isInteractPressed() && !this.dialogueManager.isActive()) {
      const interacted = this.player.tryInteract([...this.npcs, ...this.doors]);
      
      if (interacted && interacted.constructor.name === 'Door') {
        const door = interacted as Door;
        console.log(`[CaveScene] Transitioning to ${door.toSceneKey} at spawn ${door.toSpawnId}`);
        this.scene.start(door.toSceneKey, { 
          spawnId: door.toSpawnId,
          previousScene: 'CaveScene'
        });
      }
    }

    // Update debug systems
    this.debugDisplay.update(this.player);
    this.debugDraw.update(this.player, this.npcs, this.doors);
    this.debugDraw.drawEnemyZones(this.enemies, this.player);
  }

  private handlePlayerDeath(): void {
    if (this.isPlayerDead) return;
    
    this.isPlayerDead = true;
    console.log('[CaveScene] Player died! Restarting scene...');
    
    this.time.delayedCall(100, () => {
      this.scene.restart({ spawnId: this.spawnId });
      this.isPlayerDead = false;
    });
  }

  private showIntroMessage(message: string): void {
    const lines = message.split('~').map(s => s.trim()).filter(s => s.length > 0);
    this.dialogueManager.showDialogue({
      characterName: '',
      lines: lines
    });
  }
}
```

**Key Points:**
- Class name must match `sceneKey` in JSON manifest
- Constructor `key` must match JSON filename (without `.json`)
- Include all enemy and intro message logic
- Handle player death with scene restart
- Track visited scenes with static Set

### 3.3 Register Scene in Main

Edit `/client/src/main.ts` to include new scene:

```typescript
import { CaveScene } from './scenes/CaveScene';

const config: Phaser.Types.Core.GameConfig = {
  // ...
  scene: [
    BootScene,
    PreloadScene,
    VillageScene,
    ForestScene,
    CaveScene,        // ← Add new scene here
  ],
};
```

### 3.4 Register Scene Manifest in PreloadScene

Edit `/client/src/scenes/PreloadScene.ts`:

```typescript
preload() {
  // Load scene manifests
  this.load.json('villagescene', 'data/scenes/villagescene.json');
  this.load.json('forestscene', 'data/scenes/forestscene.json');
  this.load.json('cavescene', 'data/scenes/cavescene.json');    // ← Add here
  
  // ... rest of preload
}
```

---

## Phase 4: Custom Elements

### 4.1 Add NPC Dialogues

Edit `/client/public/data/dialogues.json`:

```json
{
  "elder_intro": {
    "characterName": "Village Elder",
    "lines": [
      "Welcome to our village, traveler!",
      "We are peaceful folk who live in harmony with nature.",
      "The forest to the south is... mysterious."
    ]
  },
  "cave_hermit": {
    "characterName": "Cave Hermit",
    "lines": [
      "You found my secret cave!",
      "I've been hiding here for years...",
      "The darkness protects me from them."
    ]
  }
}
```

Then update NPC's `dialogueId` in scene JSON:

```json
{
  "npcs": [
    {
      "id": "hermit",
      "x": 300,
      "y": 200,
      "spriteKey": "hermit_sprite",
      "dialogueId": "cave_hermit",    // ← Must match key in dialogues.json
      "interactionZoneSize": 64
    }
  ]
}
```

**Dialogue Rules:**
- Use `~` to split dialogue into pages (not individual lines)
- Keep character names short for UI
- Empty `characterName` creates narrator dialogue (for intro messages)

### 4.2 Add Collectible Items

Collectibles (like the Mouth item) require manual integration in the scene class.

**Step 1: Add to scene JSON** (manual addition, not in editor):

```json
{
  "collectibles": [
    {
      "id": "mouth_item",
      "itemName": "Mouth",
      "flagKey": "collected_mouth",
      "x": 500,
      "y": 200,
      "sprite": "collectible-placeholder"
    }
  ]
}
```

**Step 2: Import types** in scene class:

```typescript
import { Collectible } from '../entities/Collectible';
import { CollectibleData } from '../types';
```

**Step 3: Add to scene class**:

```typescript
export class CaveScene extends Phaser.Scene {
  private collectibles: Collectible[] = [];
  
  create() {
    // ... existing creation code ...
    
    // Create collectibles
    if (manifest.collectibles) {
      this.collectibles = SceneLoader.createCollectibles(
        this,
        manifest.collectibles
      );
    }
    
    // Add collision
    this.physics.add.overlap(
      this.player,
      this.collectibles,
      this.handleCollectiblePickup,
      undefined,
      this
    );
  }
  
  private handleCollectiblePickup(
    player: Phaser.GameObjects.GameObject,
    collectible: Phaser.GameObjects.GameObject
  ): void {
    const collectibleItem = collectible as Collectible;
    
    if (GameState.hasFlag(collectibleItem.flagKey)) {
      return; // Already collected
    }
    
    GameState.setFlag(collectibleItem.flagKey, true);
    console.log(`Collected: ${collectibleItem.itemName}`);
    
    // Show collection message
    this.dialogueManager.showDialogue({
      characterName: '',
      lines: [`You found the ${collectibleItem.itemName}!`]
    });
    
    collectibleItem.collect();
  }
}
```

### 4.3 Add Custom Behaviors

For special scene-specific logic (e.g., locked doors, conditional spawns):

```typescript
create() {
  // ... existing code ...
  
  // Example: Lock door until flag is set
  const lockedDoor = this.doors.find(d => d.getData('id') === 'secret_exit');
  if (lockedDoor && !GameState.hasFlag('found_key')) {
    lockedDoor.setPromptText('Locked - Need a key');
    lockedDoor.setInteractable(false);
  }
  
  // Example: Spawn enemy only if condition met
  if (GameState.hasFlag('boss_awakened')) {
    const bossData: EnemyData = {
      id: 'boss',
      x: 400,
      y: 300,
      spriteKey: 'boss_sprite',
      behavior: 'chase',
      speed: 150
    };
    const boss = new Enemy(this, bossData, this.player);
    this.enemies.push(boss);
  }
}
```

---

## Phase 5: Testing

### 5.1 Build & Run

```bash
cd client
npm run dev
```

### 5.2 Test Checklist

**Visual Tests:**
- [ ] Scene loads with correct background color
- [ ] All sprites render (or show placeholders if missing)
- [ ] Player spawns at correct position and facing direction
- [ ] Walls are invisible but block player movement
- [ ] Enemy patrol paths are correct
- [ ] Intro message displays on first entry (if configured)

**Interaction Tests:**
- [ ] Player can interact with NPCs (dialogue appears)
- [ ] Dialogue advances with E key and closes
- [ ] Player can trigger doors (prompt appears)
- [ ] Door transitions work (loads correct scene at correct spawn)
- [ ] Enemies detect and damage player
- [ ] Player respawns at correct location after death
- [ ] Collectibles can be picked up and persist across scene transitions

**Connection Tests:**
- [ ] Bidirectional door travel works (A→B→A)
- [ ] Player spawns at correct position when returning
- [ ] Player faces correct direction after transition
- [ ] No spawn traps (player can't get stuck in walls)

**Debug Display (F1 to toggle):**
- [ ] Shows correct scene name
- [ ] Shows correct spawn ID
- [ ] Player position updates in real-time
- [ ] Interaction zones visible for NPCs and doors
- [ ] Enemy detection ranges visible

### 5.3 Common Issues & Fixes

**Problem: Sprites don't load**
- Check `registry.json` has entry with correct `spriteKey`
- Verify PNG file exists in `client/public/assets/sprites/`
- Check browser console for 404 errors
- Ensure `spriteKey` in JSON matches registry key exactly

**Problem: Door doesn't work**
- Verify `toSceneKey` matches destination scene class name (case-sensitive)
- Check `toSpawnId` exists in destination scene's spawns array
- Ensure destination scene is registered in `main.ts` and `PreloadScene.ts`

**Problem: Player spawns in wall**
- Move spawn point in JSON to clear area
- Check wall collision boxes don't overlap spawn point
- Use debug draw (F1) to visualize spawn location

**Problem: Enemy patrol doesn't work**
- Verify patrol behavior has `patrol.a` and `patrol.b` defined
- Check coordinates are within scene bounds
- Ensure speed > 0

**Problem: Intro message doesn't show**
- Check `introMessage` field exists in scene JSON
- Verify static `visitedScenes` Set is present in scene class
- Test on fresh page load (Set resets on refresh)

---

## Appendix: JSON Format Reference

### Complete Scene Manifest Structure

```json
{
  "sceneKey": "SceneClassName",
  "name": "Display Name",
  "backgroundColor": "0x2a2a4e",
  "introMessage": "Optional welcome text~Use tilde for page breaks",
  
  "spawns": [
    {
      "id": "unique_spawn_id",
      "x": 400,
      "y": 300,
      "facing": "up"  // optional: "up", "down", "left", "right"
    }
  ],
  
  "walls": [
    {
      "x": 100,
      "y": 100,
      "width": 200,
      "height": 16
    }
  ],
  
  "npcs": [
    {
      "id": "unique_npc_id",
      "x": 300,
      "y": 200,
      "spriteKey": "npc_sprite_key",
      "dialogueId": "dialogue_key_in_dialogues_json",
      "interactionZoneSize": 64
    }
  ],
  
  "doors": [
    {
      "x": 400,
      "y": 550,
      "toSceneKey": "DestinationSceneClass",
      "toSpawnId": "destination_spawn_id",
      "promptText": "Press E to enter"
    }
  ],
  
  "enemies": [
    {
      "id": "unique_enemy_id",
      "x": 200,
      "y": 300,
      "spriteKey": "enemy_sprite_key",
      "behavior": "patrol",  // "patrol", "chase", or "hazard"
      "speed": 80,
      "patrol": {            // only for "patrol" behavior
        "a": { "x": 200, "y": 300 },
        "b": { "x": 400, "y": 300 }
      }
    }
  ],
  
  "collectibles": [
    {
      "id": "unique_collectible_id",
      "itemName": "Item Name",
      "flagKey": "game_state_flag_key",
      "x": 500,
      "y": 200,
      "sprite": "collectible_sprite_key"
    }
  ]
}
```

### Field Constraints

**Required Fields:**
- `sceneKey` (string) - Must match TypeScript class name
- `name` (string) - User-friendly display name
- `spawns` (array) - Must have at least one spawn with `id: "default"`

**Optional Fields:**
- `backgroundColor` (hex string) - Default: `0x1a1a1a`
- `introMessage` (string) - Narrator dialogue on first visit
- `walls` (array) - Collision boxes
- `npcs` (array) - Interactive characters
- `doors` (array) - Scene transitions
- `enemies` (array) - Threats/hazards
- `collectibles` (array) - Pickable items

**Coordinate System:**
- Origin (0, 0) is top-left
- Default scene size: 800x600
- Grid snap: 8px (configurable in editor)

---

## Quick Reference: Full Workflow Checklist

### ✅ Editor Phase
- [ ] Create scene in editor
- [ ] Add walls, spawns, doors, NPCs, enemies
- [ ] Upload all sprite PNGs
- [ ] Configure intro message (if needed)
- [ ] Export JSON

### ✅ Asset Phase
- [ ] Copy sprite PNGs to `client/public/assets/sprites/`
- [ ] Update `registry.json` with new sprite entries

### ✅ Integration Phase
- [ ] Save scene JSON in `client/public/data/scenes/`
- [ ] Set correct `sceneKey` in JSON
- [ ] Update door `toSceneKey` and `toSpawnId` for connections
- [ ] Create scene TypeScript class in `client/src/scenes/`
- [ ] Register scene in `main.ts`
- [ ] Add manifest load in `PreloadScene.ts`

### ✅ Content Phase
- [ ] Add NPC dialogues to `dialogues.json`
- [ ] Update NPC `dialogueId` in scene JSON
- [ ] Add collectibles manually (if needed)
- [ ] Add custom scene behaviors (if needed)

### ✅ Testing Phase
- [ ] Visual checks (sprites, layout, colors)
- [ ] Interaction checks (NPCs, doors, enemies)
- [ ] Connection checks (scene transitions)
- [ ] Debug display verification

---

**Workflow Version:** 1.0  
**Last Updated:** January 12, 2026  
**Maintained By:** Development Team

