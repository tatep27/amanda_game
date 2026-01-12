# Editor NPC Enhancements - Testing Guide

## Implementation Complete ✅

All code changes have been implemented for the editor NPC enhancements.

## Changes Made

### 1. Updated NPC Creation (`editor/editor.js` - addNpc method)
**New Prompts:**
1. "Enter NPC ID" - e.g., `elder`
2. "Enter Character Name" - e.g., `Village Elder` ⬅️ NEW
3. "Enter Dialogue (use ~ for page breaks)" - e.g., `Hi!~How are you?~Goodbye!` ⬅️ NEW

**Data Structure:**
NPCs now store:
```javascript
{
  id: 'elder',
  x: 200,
  y: 300,
  spriteKey: 'npc-placeholder',
  dialogueId: 'elder_dialogue',  // auto-generated from id
  interactionZoneSize: 64,
  characterName: 'Village Elder',  // NEW
  dialogueText: 'Hi!~How are you?~Goodbye!'  // NEW
}
```

### 2. Enhanced Export Logic (`exportJSON` and `downloadJSON` methods)

**Now exports TWO files:**

**File 1: Scene Manifest** (`scenename.json`)
```json
{
  "sceneKey": "TestScene",
  "npcs": [{
    "id": "elder",
    "x": 200,
    "y": 300,
    "spriteKey": "npc-placeholder",
    "dialogueId": "elder_dialogue",
    "interactionZoneSize": 64
  }]
}
```
Note: `characterName` and `dialogueText` are stripped (editor-only metadata)

**File 2: Dialogues** (`scenename_dialogues.json`)
```json
{
  "elder_dialogue": {
    "characterName": "Village Elder",
    "lines": [
      "Hi!",
      "How are you?",
      "Goodbye!"
    ]
  }
}
```
Note: `~` delimiter is auto-split into array

**Alert Message:**
User sees helpful message about where to copy each file.

### 3. Properties Panel Enhancement (`updatePropertiesPanel` method)

When selecting an NPC, now shows:
- ID
- Character Name ⬅️ NEW
- Dialogue ID
- Dialogue Text (in textarea) ⬅️ NEW
- Page count (e.g., "3 pages") ⬅️ NEW
- Position

## Manual Testing Steps

### Test 1: Create NPC with Dialogue

1. **Open editor** (if not already open, run: `open -a "Google Chrome" /Users/tatepark/Projects/amanda/editor/index.html`)
2. Click "New" button
3. Fill scene settings:
   - Scene Key: `TestScene`
   - Scene Name: `Test Scene`
4. Click **NPC tool** button
5. Click on canvas (e.g., at center)
6. **Prompt 1**: Enter `test_npc` → Click OK
7. **Prompt 2**: Enter `Test Character` → Click OK
8. **Prompt 3**: Enter `Hello!~How are you today?~Nice to meet you!~Goodbye!` → Click OK
9. **Verify**: Green circle with "test_npc" label appears

**Expected Result:** ✅ NPC created with 3 prompts

### Test 2: View NPC Properties

1. Click **Select tool** button
2. Click the NPC you just created
3. **Check Properties Panel** shows:
   - Type: npc
   - ID: test_npc
   - Character Name: Test Character
   - Dialogue ID: test_npc_dialogue
   - Dialogue Text: `Hello!~How are you today?~Nice to meet you!~Goodbye!`
   - **"4 pages"** label below textarea
   - Position: (x, y)

**Expected Result:** ✅ All fields populated, including new character name and dialogue text

### Test 3: Export Scene with Dialogue

1. Click **"Export JSON"** button
2. **Check alert message** appears saying:
   ```
   Exported 2 files:
   1. testscene.json (scene manifest → copy to client/public/data/scenes/)
   2. testscene_dialogues.json (dialogues → merge into client/public/data/dialogues.json)
   ```
3. **Check Downloads folder** - should have 2 files

**Expected Result:** ✅ Two files downloaded, alert shows file info

### Test 4: Verify Scene JSON Structure

Open `testscene.json` and verify:

```json
{
  "sceneKey": "TestScene",
  "name": "Test Scene",
  "backgroundColor": "0x2a2a4e",
  "spawns": [],
  "walls": [],
  "npcs": [
    {
      "id": "test_npc",
      "x": <number>,
      "y": <number>,
      "spriteKey": "npc-placeholder",
      "dialogueId": "test_npc_dialogue",
      "interactionZoneSize": 64
    }
  ],
  "doors": []
}
```

**Check:**
- ✅ NPC has only 6 fields (no characterName or dialogueText)
- ✅ dialogueId is auto-generated as `{id}_dialogue`
- ✅ Clean structure ready for game

**Expected Result:** ✅ Scene manifest has correct structure

### Test 5: Verify Dialogues JSON Structure

Open `testscene_dialogues.json` and verify:

```json
{
  "test_npc_dialogue": {
    "characterName": "Test Character",
    "lines": [
      "Hello!",
      "How are you today?",
      "Nice to meet you!",
      "Goodbye!"
    ]
  }
}
```

**Check:**
- ✅ Dialogue ID matches NPC's dialogueId
- ✅ characterName preserved
- ✅ lines array has 4 items (split on ~)
- ✅ Each line is trimmed (no extra spaces)
- ✅ No ~ symbols in output

**Expected Result:** ✅ Dialogue properly formatted for game

### Test 6: Multiple NPCs

1. Create another NPC:
   - ID: `guard`
   - Name: `Town Guard`
   - Dialogue: `Halt!~State your business.`
2. Export again
3. **Check** `testscene_dialogues.json` now has TWO entries:
   ```json
   {
     "test_npc_dialogue": { ... },
     "guard_dialogue": { ... }
   }
   ```

**Expected Result:** ✅ Multiple NPCs exported to same dialogue file

### Test 7: Backward Compatibility

1. Click "Load" and load `VillageScene` (if available)
2. **Check** that old NPCs without characterName/dialogueText:
   - Still appear on canvas
   - Show in properties as "Not set"
   - Export without errors

**Expected Result:** ✅ Old NPCs still work, won't export dialogue data

### Test 8: Integration with Game

1. Copy `testscene.json` to `/Users/tatepark/Projects/amanda/client/public/data/scenes/`
2. Copy content from `testscene_dialogues.json` and **merge** into `/Users/tatepark/Projects/amanda/client/public/data/dialogues.json`
3. Update game config to include TestScene (if needed)
4. Refresh game at http://localhost:3001/
5. Navigate to TestScene
6. Approach NPC
7. **Check prompt shows**: `[Test Character] Press E to talk` (once NPC name prompt feature is added to game)
8. Press E multiple times
9. **Verify** all 4 dialogue pages appear in sequence

**Expected Result:** ✅ Game loads scene and dialogue correctly

## Test Results Summary

| Test | Status | Notes |
|------|--------|-------|
| NPC Creation (3 prompts) | ⏳ Needs manual test | |
| Properties Panel Display | ⏳ Needs manual test | |
| Export 2 Files | ⏳ Needs manual test | |
| Scene JSON Structure | ⏳ Needs manual test | |
| Dialogue JSON Structure | ⏳ Needs manual test | |
| Multiple NPCs | ⏳ Needs manual test | |
| Backward Compatibility | ⏳ Needs manual test | |
| Game Integration | ⏳ Needs manual test | |

## Success Criteria

All tests pass with ✅ marks:
- [x] Code implementation complete
- [ ] Editor creates NPCs with 3 prompts
- [ ] Properties panel shows character name and dialogue
- [ ] Export creates 2 files
- [ ] Scene JSON has correct structure (no editor fields)
- [ ] Dialogue JSON has split lines array
- [ ] Multiple NPCs work
- [ ] Backward compatible with old NPCs
- [ ] Game can load and display multi-page dialogue

## Known Issues / Notes

1. **Manual merge required**: Dialogue JSON must be manually merged into main dialogues.json (can't auto-merge without file system access)
2. **No undo**: Once NPC is created, can't edit dialogue (must delete and recreate)
3. **Future enhancement**: In-game NPC name prompt still needs implementation (separate task)

## Next Steps

1. **User testing required** - Please test in the editor
2. **Report any issues** - If anything doesn't work as expected
3. **Ready for NPC name prompt feature** - Can now implement showing `[Character Name] Press E to talk` in the game

