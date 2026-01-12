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
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/3dc239ea-6447-4119-bff1-3f5a1ef9df71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'IntroScene.ts:115',message:'Creating enemies',data:{enemyCount:manifest.enemies.length},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      this.enemies = SceneLoader.createEnemies(this, manifest.enemies, this.player);
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/3dc239ea-6447-4119-bff1-3f5a1ef9df71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'IntroScene.ts:119',message:'Created enemies',data:{enemyCount:this.enemies.length},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
    }
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/3dc239ea-6447-4119-bff1-3f5a1ef9df71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'IntroScene.ts:124',message:'About to setup collisions',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'E'})}).catch(()=>{});
    // #endregion

    // Setup collisions
    this.physics.add.collider(this.player, this.walls);
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/3dc239ea-6447-4119-bff1-3f5a1ef9df71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'IntroScene.ts:129',message:'Added player-wall collider',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    this.physics.add.overlap(this.player, this.npcs);
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/3dc239ea-6447-4119-bff1-3f5a1ef9df71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'IntroScene.ts:133',message:'Added player-npc overlap',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    this.physics.add.overlap(this.player, this.doors);
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/3dc239ea-6447-4119-bff1-3f5a1ef9df71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'IntroScene.ts:137',message:'Added player-door overlap',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    if (this.enemies.length > 0) {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/3dc239ea-6447-4119-bff1-3f5a1ef9df71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'IntroScene.ts:141',message:'Adding enemy collision',data:{enemyCount:this.enemies.length},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      this.physics.add.overlap(
        this.player,
        this.enemies,
        this.handlePlayerDeath,
        undefined,
        this
      );
    }
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/3dc239ea-6447-4119-bff1-3f5a1ef9df71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'IntroScene.ts:151',message:'About to initialize systems',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'E'})}).catch(()=>{});
    // #endregion

    // Initialize remaining systems
    this.debugDisplay = new DebugDisplay(this, this.player);
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/3dc239ea-6447-4119-bff1-3f5a1ef9df71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'IntroScene.ts:156',message:'Created DebugDisplay',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    this.debugDraw = new DebugDraw(this);
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/3dc239ea-6447-4119-bff1-3f5a1ef9df71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'IntroScene.ts:160',message:'Created DebugDraw',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    this.dialogueBox = new DialogueBox(this);
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/3dc239ea-6447-4119-bff1-3f5a1ef9df71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'IntroScene.ts:164',message:'Created DialogueBox',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    this.interactionPrompt = new InteractionPrompt(this);

    // Show intro message if first visit
    if (manifest.introMessage && !IntroScene.visitedScenes.has('IntroScene')) {
      IntroScene.visitedScenes.add('IntroScene');
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/3dc239ea-6447-4119-bff1-3f5a1ef9df71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'IntroScene.ts:174',message:'Scheduling intro message for next frame',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      // Defer intro message to next frame to ensure create() completes first
      this.time.delayedCall(100, () => {
        this.showIntroMessage(manifest.introMessage!);
      });
    }

    // Camera follow player
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/3dc239ea-6447-4119-bff1-3f5a1ef9df71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'IntroScene.ts:183',message:'About to setup camera',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1);
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/3dc239ea-6447-4119-bff1-3f5a1ef9df71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'IntroScene.ts:99',message:'IntroScene create() COMPLETE',data:{showedIntro:!!manifest.introMessage},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
  }

  private updateCount = 0;
  
  update(time: number, delta: number) {
    // #region agent log - log first 3 update calls
    this.updateCount++;
    if (this.updateCount <= 3) {
      fetch('http://127.0.0.1:7244/ingest/3dc239ea-6447-4119-bff1-3f5a1ef9df71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'IntroScene.ts:212',message:'update() START',data:{updateCount:this.updateCount,time:Math.floor(time),isDead:this.isPlayerDead},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'E'})}).catch(()=>{});
    }
    // #endregion
    if (this.isPlayerDead) return;

    // Update player
    this.player.update();
    // #region agent log
    if (this.updateCount <= 3) {
      fetch('http://127.0.0.1:7244/ingest/3dc239ea-6447-4119-bff1-3f5a1ef9df71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'IntroScene.ts:224',message:'player.update() done',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'E'})}).catch(()=>{});
    }
    // #endregion

    // Update enemies
    for (const enemy of this.enemies) {
      enemy.update(this.player);
    }
    // #region agent log
    if (this.updateCount <= 3) {
      fetch('http://127.0.0.1:7244/ingest/3dc239ea-6447-4119-bff1-3f5a1ef9df71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'IntroScene.ts:232',message:'enemies updated',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'E'})}).catch(()=>{});
    }
    // #endregion

    // #region agent log - check inputManager
    if (this.updateCount <= 3) {
      fetch('http://127.0.0.1:7244/ingest/3dc239ea-6447-4119-bff1-3f5a1ef9df71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'IntroScene.ts:239',message:'about to check inputManager',data:{hasInputManager:!!this.inputManager,hasDialogueBox:!!this.dialogueBox},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'F'})}).catch(()=>{});
    }
    // #endregion
    // Check interactions (NPCs and Doors)
    const isInteractPressed = this.inputManager.isInteractJustPressed();
    // #region agent log
    if (this.updateCount <= 3) {
      fetch('http://127.0.0.1:7244/ingest/3dc239ea-6447-4119-bff1-3f5a1ef9df71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'IntroScene.ts:245',message:'isInteractPressed checked',data:{isInteractPressed},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'F'})}).catch(()=>{});
    }
    // #endregion
    const dialogueActive = this.dialogueBox.hasActiveDialogue();
    // #region agent log
    if (this.updateCount <= 3) {
      fetch('http://127.0.0.1:7244/ingest/3dc239ea-6447-4119-bff1-3f5a1ef9df71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'IntroScene.ts:251',message:'dialogueActive checked',data:{dialogueActive},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'F'})}).catch(()=>{});
    }
    // #endregion
    if (isInteractPressed) {
      if (dialogueActive) {
        // Advance dialogue when E is pressed
        this.dialogueBox.advance();
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
    // #region agent log
    if (this.updateCount <= 3) {
      fetch('http://127.0.0.1:7244/ingest/3dc239ea-6447-4119-bff1-3f5a1ef9df71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'IntroScene.ts:270',message:'interactions checked DONE',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'F'})}).catch(()=>{});
    }
    // #endregion

    // Check for nearby interactables and show prompt
    const nearbyInteractable = this.player.getNearbyInteractable([...this.npcs, ...this.doors]);
    // #region agent log - debug interaction prompt
    if (this.updateCount <= 5) {
      fetch('http://127.0.0.1:7244/ingest/3dc239ea-6447-4119-bff1-3f5a1ef9df71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'IntroScene.ts:280',message:'Checking nearby interactable',data:{hasNearby:!!nearbyInteractable,nearbyId:nearbyInteractable?.getInteractionId(),playerX:Math.round(this.player.x),playerY:Math.round(this.player.y),doorCount:this.doors.length,npcCount:this.npcs.length,dialogueActive},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'G'})}).catch(()=>{});
    }
    // #endregion
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
    // #region agent log
    if (this.updateCount <= 3) {
      fetch('http://127.0.0.1:7244/ingest/3dc239ea-6447-4119-bff1-3f5a1ef9df71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'IntroScene.ts:266',message:'debugDisplay updated',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'E'})}).catch(()=>{});
    }
    // #endregion
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
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/3dc239ea-6447-4119-bff1-3f5a1ef9df71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'IntroScene.ts:246',message:'showIntroMessage START',data:{messageLength:message.length},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    const lines = message.split('~').map(s => s.trim()).filter(s => s.length > 0);
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/3dc239ea-6447-4119-bff1-3f5a1ef9df71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'IntroScene.ts:250',message:'Split message into lines',data:{lineCount:lines.length,lines:lines},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    this.dialogueBox.showDialogue({
      characterName: '',
      lines: lines
    });
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/3dc239ea-6447-4119-bff1-3f5a1ef9df71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'IntroScene.ts:256',message:'Called showDialogue',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
  }
}

