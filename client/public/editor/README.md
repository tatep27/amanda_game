# Scene Editor - User Guide

## Overview

This is a simple web-based editor for creating and editing scene manifests for the Amanda game. It allows you to visually place walls, NPCs, doors, and spawn points, then export them as JSON files.

## Getting Started

1. Open `editor/index.html` in your web browser
2. The editor canvas (800x600) represents your game scene

## Tools

### Select Tool
- Click on entities to select them
- View and edit properties in the sidebar
- Selected entity is highlighted with a magenta outline

### Wall Tool
- Click and drag to create rectangular walls
- Walls are represented as gray rectangles
- Grid snapping helps align walls precisely

### NPC Tool
- Click to place an NPC
- You will be prompted for:
  1. **NPC ID**: Unique identifier (e.g., `elder`, `guard`)
  2. **Character Name**: Display name shown in dialogue (e.g., `Village Elder`)
  3. **Dialogue Text**: Write dialogue with `~` for page breaks (e.g., `Hello!~How are you?~Goodbye!`)
- NPCs are shown as green circles with labels
- Dialogue will be auto-split into pages on export

### Enemy Tool
- Click to place an enemy
- You will be prompted for:
  1. **Enemy ID**: Unique identifier (e.g., `slime_01`, `guard_patrol`)
  2. **Behavior**: One of `patrol`, `chase`, or `hazard`
  3. **Speed**: Movement speed in pixels per second (e.g., `80`)
- Enemies are shown as colored diamonds:
  - **Red**: Patrol enemies (moves between two points)
  - **Orange**: Chase enemies (follows player when in range)
  - **Purple**: Hazard enemies (stationary death zones)
- For patrol enemies, patrol path and points A/B are visualized
- Select an enemy to edit behavior, speed, and patrol points in the properties panel

### Door Tool
- Click to place a door
- Enter target scene key and spawn ID
- Doors are shown as blue rectangles with arrows

### Spawn Tool
- Click to place a spawn point
- Enter spawn ID and optional facing direction
- Spawns are shown as yellow stars

### Delete Tool
- Click on any entity to delete it

## Scene Settings

In the sidebar, you can configure:
- **Scene Key**: Technical identifier (e.g., "VillageScene")
- **Scene Name**: Display name (e.g., "Village")
- **Background Color**: Hex color for the scene background

## Grid Snap

Click "Grid Snap: ON/OFF" in the bottom-left to toggle grid snapping. When enabled, all placements align to a 16-pixel grid.

## Exporting

1. Click "Export JSON" button
2. **Two files** will be downloaded:
   - `scenename.json` - Scene manifest (copy to `client/public/data/scenes/`)
   - `scenename_dialogues.json` - Dialogue data (merge into `client/public/data/dialogues.json`)
3. An alert will show instructions for where to copy each file
4. The game will automatically load the scene when properly placed

## Importing

1. Click "Import JSON" button
2. Select a JSON file from your computer
3. The scene will be loaded into the editor

## Loading Existing Scenes

1. Select a scene from the dropdown (VillageScene or ForestScene)
2. Click "Load" button
3. The scene will be loaded from `client/public/data/scenes/`

## Creating a New Scene

1. Click "New" button to clear the canvas
2. Use tools to place entities
3. Configure scene settings
4. Export when done

## Tips

- Use the wall tool to create boundaries and obstacles
- Place spawn points before testing the scene
- Make sure each door has a corresponding spawn point in the target scene
- **NEW**: Write NPC dialogue directly in the editor using `~` to separate pages
- **NEW**: Character names from NPCs will be used in dialogue prompts
- The canvas size (800x600) matches the game's viewport

## Workflow Example

1. Create scene boundaries with wall tool
2. Add spawn points (at least "default" and any entry points)
3. Place interior walls/obstacles
4. Add NPCs:
   - Enter NPC ID (e.g., `elder`)
   - Enter character name (e.g., `Village Elder`)
   - Enter dialogue with `~` separators (e.g., `Welcome!~How can I help?~Goodbye!`)
5. Add enemies:
   - Enter enemy ID (e.g., `slime_01`)
   - Choose behavior (`patrol`, `chase`, or `hazard`)
   - Set speed (e.g., `80` for patrol/chase)
   - For patrol: select enemy and use "Set Point A/B" buttons to define patrol path
6. Add doors to other scenes
7. Export JSON (creates 2 files)
8. Copy scene JSON to `client/public/data/scenes/`
9. **Merge** dialogue JSON into `client/public/data/dialogues.json`
10. Test in game

## JSON Format

The exported **scene manifest** follows this structure:

```json
{
  "sceneKey": "MyScene",
  "name": "My Scene",
  "backgroundColor": "0x2a2a4e",
  "spawns": [
    { "id": "default", "x": 400, "y": 300 }
  ],
  "walls": [
    { "x": 50, "y": 50, "width": 700, "height": 16 }
  ],
  "npcs": [
    { 
      "id": "elder", 
      "x": 200, 
      "y": 300, 
      "spriteKey": "npc-placeholder", 
      "dialogueId": "elder_dialogue",
      "interactionZoneSize": 64
    }
  ],
  "doors": [
    { 
      "x": 400, 
      "y": 560, 
      "width": 32,
      "height": 48,
      "toSceneKey": "OtherScene", 
      "toSpawnId": "fromMyScene", 
      "promptText": "Press E to enter" 
    }
  ],
  "enemies": [
    {
      "id": "slime_01",
      "x": 300,
      "y": 200,
      "spriteKey": "enemy-placeholder",
      "behavior": "patrol",
      "speed": 80,
      "patrol": {
        "a": { "x": 200, "y": 200 },
        "b": { "x": 400, "y": 200 }
      }
    },
    {
      "id": "guard_chase",
      "x": 500,
      "y": 300,
      "spriteKey": "enemy-placeholder",
      "behavior": "chase",
      "speed": 120
    },
    {
      "id": "hazard_spikes",
      "x": 350,
      "y": 450,
      "spriteKey": "enemy-placeholder",
      "behavior": "hazard",
      "speed": 0
    }
  ]
}
```

The exported **dialogues** file follows this structure:

```json
{
  "elder_dialogue": {
    "characterName": "Village Elder",
    "lines": [
      "Welcome to our village!",
      "How may I help you?",
      "Farewell, traveler."
    ]
  }
}
```

**Note:** The `~` separator in your editor input (e.g., `Welcome!~How may I help?~Farewell!`) is automatically split into the `lines` array on export.

## Troubleshooting

- **Can't see entities**: Make sure you're using the correct tool
- **Grid snap too coarse**: Disable grid snap for precise placement
- **Export doesn't work**: Check browser console for errors
- **Scene won't load in game**: Validate JSON syntax and check console

## Next Steps

After creating your scene:
1. Copy scene manifest to `client/public/data/scenes/`
2. **Merge** dialogue entries into `client/public/data/dialogues.json` (copy-paste the dialogue objects)
3. Update `client/src/game/config.ts` to include your scene in the scene list (if needed)
4. Test transitions between scenes
5. Iterate and refine placement

### Merging Dialogues Example

If `client/public/data/dialogues.json` has:
```json
{
  "existing_dialogue": { ... }
}
```

And your export has:
```json
{
  "new_npc_dialogue": { ... }
}
```

Merge to:
```json
{
  "existing_dialogue": { ... },
  "new_npc_dialogue": { ... }
}
```

