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
import { DialogueBox } from '../ui/DialogueBox';
import { InteractionPrompt } from '../ui/InteractionPrompt';
import { SceneManifest } from '../types';

export class Ch3Scene extends Phaser.Scene {
  private player!: Player;
  private walls: Wall[] = [];
  private npcs: Npc[] = [];
  private doors: Door[] = [];
  private enemies: Enemy[] = [];
  private inputManager!: InputManager;
  private debugDisplay!: DebugDisplay;
  private debugDraw!: DebugDraw;
  private dialogueBox!: DialogueBox;
  private interactionPrompt!: InteractionPrompt;
  private isPlayerDead: boolean = false;
  
  private spawnId: string = 'default';
  
  // Track visited scenes for intro messages
  static visitedScenes: Set<string> = new Set();

  constructor() {
    super({ key: 'ch3' });
  }

  init(data: { spawnId?: string; previousScene?: string }) {
    this.spawnId = data.spawnId || 'default';
    this.isPlayerDead = false; // Reset death flag on scene init
    console.log(`[Ch3Scene] init with spawn: ${this.spawnId}, previousScene: ${data.previousScene}`);
  }

  create() {
    const manifest = this.cache.json.get('ch3') as SceneManifest;
    
    if (!manifest) {
      console.error('[Ch3Scene] Failed to load ch3.json');
      return;
    }

    console.log('[Ch3Scene] Loaded manifest:', manifest.sceneKey, manifest.name);

    // Set background
    this.cameras.main.setBackgroundColor(manifest.backgroundColor || '#000000');

    // Create placeholder textures
    PlaceholderGraphics.createWallTexture(this);
    PlaceholderGraphics.createNpcTexture(this);
    PlaceholderGraphics.createEnemyTexture(this);
    PlaceholderGraphics.createDoorTexture(this);

    // Find spawn point
    const spawn = manifest.spawns.find(s => s.id === this.spawnId) || manifest.spawns[0];
    
    // Create input manager before player
    this.inputManager = new InputManager(this);

    // Create player at spawn
    this.player = new Player(this, spawn.x, spawn.y, this.inputManager);
    this.player.setDepth(10);

    // Create walls
    this.walls = SceneLoader.createWalls(this, manifest.walls);

    // Create NPCs using SceneLoader (handles scaling automatically)
    this.npcs = SceneLoader.createNpcs(this, manifest.npcs);

    // Create doors
    this.doors = SceneLoader.createDoors(this, manifest.doors);

    // Create enemies
    if (manifest.enemies && manifest.enemies.length > 0) {
      this.enemies = SceneLoader.createEnemies(this, manifest.enemies, this.player);
    }

    // Setup physics collisions
    this.physics.add.collider(this.player, this.walls);
    // NPC and Door overlaps are handled via player.getNearbyInteractable() distance checks

    // Setup enemy collisions if any enemies exist
    if (this.enemies.length > 0) {
      this.physics.add.overlap(
        this.player,
        this.enemies,
        this.handlePlayerDeath,
        undefined,
        this
      );
    }

    // Initialize remaining systems
    this.debugDisplay = new DebugDisplay(this, this.player);
    this.debugDraw = new DebugDraw(this);
    this.dialogueBox = new DialogueBox(this);
    this.interactionPrompt = new InteractionPrompt(this);

    // Show intro message if first visit
    if (manifest.introMessage && !Ch3Scene.visitedScenes.has('ch3')) {
      Ch3Scene.visitedScenes.add('ch3');
      this.time.delayedCall(100, () => {
        this.showIntroMessage(manifest.introMessage!);
      });
    }

    // Camera follow player
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1);
  }

  update(_time: number, _delta: number) {
    if (this.isPlayerDead) return;

    // Check if dialogue is active to pause gameplay
    const dialogueActive = this.dialogueBox.hasActiveDialogue();

    // Update player (only if dialogue not active)
    if (!dialogueActive) {
      this.player.update();
    }

    // Update enemies (only if dialogue not active)
    if (!dialogueActive) {
      for (const enemy of this.enemies) {
        enemy.update(this.player);
      }
    }

    // Check interactions (NPCs and Doors)
    const isInteractPressed = this.inputManager.isInteractJustPressed();
    
    if (isInteractPressed) {
      if (dialogueActive) {
        // Advance dialogue when E is pressed
        this.dialogueBox.advance();
      } else {
        // Check for NPC/door interactions when no dialogue is active
        const interacted = this.player.tryInteract([...this.npcs, ...this.doors]);
        
        if (interacted instanceof Door) {
          const toSceneKey = interacted.getToSceneKey();
          const toSpawnId = interacted.getToSpawnId();
          console.log(`[Ch3Scene] Transitioning to ${toSceneKey} at spawn ${toSpawnId}`);
          this.scene.start(toSceneKey, { 
            spawnId: toSpawnId,
            previousScene: 'ch3'
          });
        } else if (interacted instanceof Npc) {
          const dialogue = interacted.getDialogue();
          this.dialogueBox.showDialogue(dialogue);
        }
      }
    }

    // Check for nearby interactables and show prompt
    const nearbyInteractable = this.player.getNearbyInteractable([...this.npcs, ...this.doors]);
    if (nearbyInteractable && !dialogueActive) {
      const promptPos = nearbyInteractable.getPromptPosition();
      this.interactionPrompt.show(
        promptPos.x,
        promptPos.y,
        nearbyInteractable.getPromptText()
      );
    } else {
      this.interactionPrompt.hide();
    }

    // Update debug systems
    this.debugDisplay.update();
    this.debugDraw.update();
  }

  private handlePlayerDeath(): void {
    if (this.isPlayerDead) return;
    
    this.isPlayerDead = true;
    console.log('[Ch3Scene] Player died! Restarting scene...');
    
    this.time.delayedCall(100, () => {
      this.scene.restart({ spawnId: this.spawnId });
    });
  }

  private showIntroMessage(message: string): void {
    const lines = message.split('~').map(s => s.trim()).filter(s => s.length > 0);
    this.dialogueBox.showDialogue({
      characterName: '',
      lines: lines
    });
  }
}

