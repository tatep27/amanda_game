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
import { GameState } from '../systems/GameState';
import { SceneManifest, EnemyData } from '../types';

export class IntroScene extends Phaser.Scene {
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
  private blackOverlay?: Phaser.GameObjects.Rectangle;
  
  private spawnId: string = 'default';
  
  // Track visited scenes for intro messages
  static visitedScenes: Set<string> = new Set();

  constructor() {
    super({ key: 'IntroScene' });
  }

  init(data: { spawnId?: string; previousScene?: string }) {
    this.spawnId = data.spawnId || 'spawn_1';
    console.log(`[IntroScene] init with spawn: ${this.spawnId}`);
  }

  create() {
    // Load scene manifest
    const manifest: SceneManifest = this.cache.json.get('introscene');
    
    // Set background color
    this.cameras.main.setBackgroundColor(manifest.backgroundColor || 0x3b3b3b);
    
    // Create placeholder textures
    PlaceholderGraphics.createWallTexture(this);
    PlaceholderGraphics.createNpcTexture(this);
    PlaceholderGraphics.createEnemyTexture(this);
    PlaceholderGraphics.createDoorTexture(this);

    // Find spawn point
    const spawn = manifest.spawns.find(s => s.id === this.spawnId) || manifest.spawns[0];
    
    // Initialize InputManager FIRST (Player needs it in constructor)
    this.inputManager = new InputManager(this);
    
    // Create player
    this.player = new Player(this, spawn.x, spawn.y, this.inputManager);
    // Note: Player facing direction is managed internally, spawn.facing is not used

    // Create walls
    this.walls = SceneLoader.createWalls(this, manifest.walls);

    // Create NPCs
    this.npcs = SceneLoader.createNpcs(this, manifest.npcs);

    // Create doors
    this.doors = SceneLoader.createDoors(this, manifest.doors);

    // Create enemies
    if (manifest.enemies && manifest.enemies.length > 0) {
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

    // Initialize remaining systems
    this.debugDisplay = new DebugDisplay(this, this.player);
    this.debugDraw = new DebugDraw(this);
    this.dialogueBox = new DialogueBox(this);
    this.interactionPrompt = new InteractionPrompt(this);

    // Create black overlay (full screen, on top of everything)
    this.blackOverlay = this.add.rectangle(
      0,
      0,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000,
      1
    );
    this.blackOverlay.setOrigin(0, 0);
    this.blackOverlay.setDepth(10000); // Very high depth to be on top of everything
    this.blackOverlay.setScrollFactor(0); // Don't move with camera

    // Show intro message if first visit
    if (manifest.introMessage && !IntroScene.visitedScenes.has('IntroScene')) {
      IntroScene.visitedScenes.add('IntroScene');
      // Defer intro message to next frame to ensure create() completes first
      this.time.delayedCall(100, () => {
        this.showIntroMessage(manifest.introMessage!);
      });
    } else {
      // If no intro message, immediately fade out the black screen
      this.fadeOutBlackScreen();
    }

    // Camera follow player
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1);
  }

  private fadeOutBlackScreen(): void {
    if (!this.blackOverlay) return;
    
    this.tweens.add({
      targets: this.blackOverlay,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => {
        this.blackOverlay?.destroy();
        this.blackOverlay = undefined;
      }
    });
  }
  
  update(time: number, delta: number) {
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
        const hasMoreLines = this.dialogueBox.advance();
        
        // If intro dialogue just finished and black screen is still visible, fade it out
        if (!hasMoreLines && this.blackOverlay) {
          this.fadeOutBlackScreen();
        }
      } else {
        // Check for NPC/door interactions when no dialogue is active
        const interacted = this.player.tryInteract([...this.npcs, ...this.doors]);
        
        if (interacted && interacted.constructor.name === 'Door') {
          const door = interacted as Door;
          const toSceneKey = door.getToSceneKey();
          const toSpawnId = door.getToSpawnId();
          console.log(`[IntroScene] Transitioning to ${toSceneKey} at spawn ${toSpawnId}`);
          this.scene.start(toSceneKey, { 
            spawnId: toSpawnId,
            previousScene: 'IntroScene'
          });
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
    console.log('[IntroScene] Player died! Restarting scene...');
    
    this.time.delayedCall(100, () => {
      this.scene.restart({ spawnId: this.spawnId });
      this.isPlayerDead = false;
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
