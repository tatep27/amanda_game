import Phaser from 'phaser';
import { InputManager } from '@/engine/InputManager';
import { PlaceholderGraphics } from '@/engine/PlaceholderGraphics';
import { DebugDisplay } from '@/engine/DebugDisplay';
import { DebugDraw } from '@/engine/DebugDraw';
import { Player } from '@/entities/Player';
import { Wall } from '@/entities/Wall';
import { Npc } from '@/entities/Npc';
import { InteractionPrompt } from '@/ui/InteractionPrompt';
import { DialogueBox } from '@/ui/DialogueBox';
import { DialogueData } from '@/types';

export class WorldScene extends Phaser.Scene {
  private inputManager!: InputManager;
  private player!: Player;
  private debugDisplay!: DebugDisplay;
  private debugDraw!: DebugDraw;
  private debugToggleKey!: Phaser.Input.Keyboard.Key;
  private debugDrawToggleKey!: Phaser.Input.Keyboard.Key;
  private wallsGroup!: Phaser.Physics.Arcade.StaticGroup;
  
  // Phase 3: Interaction system
  private npcs: Npc[] = [];
  private nearbyNpc: Npc | null = null;
  private interactionPrompt!: InteractionPrompt;
  private dialogueBox!: DialogueBox;

  constructor() {
    super({ key: 'WorldScene' });
  }

  create(): void {
    console.log('[WorldScene] World scene started');

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Set up world bounds (player cannot leave this area)
    this.physics.world.setBounds(0, 0, width, height);

    // Draw background
    const bg = this.add.rectangle(0, 0, width, height, 0x2a2a4e);
    bg.setOrigin(0, 0);

    // Create placeholder graphics
    PlaceholderGraphics.createPlayerTexture(this);
    PlaceholderGraphics.createWallTexture(this);
    PlaceholderGraphics.createNpcTexture(this);

    // Initialize input manager
    this.inputManager = new InputManager(this);

    // Create physics group for walls
    this.wallsGroup = this.physics.add.staticGroup();

    // Create test walls
    this.createWalls();

    // Create player at center of screen
    this.player = new Player(this, width / 2, height / 2, this.inputManager);

    // Set up collision between player and walls
    this.physics.add.collider(this.player, this.wallsGroup);

    // Phase 3: Create NPCs
    this.createNpcs();

    // Phase 3: Create UI components
    this.interactionPrompt = new InteractionPrompt(this);
    this.dialogueBox = new DialogueBox(this);

    // Create debug systems
    this.debugDisplay = new DebugDisplay(this, this.player);
    this.debugDraw = new DebugDraw(this);

    // Set up debug toggle keys
    this.debugToggleKey = this.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.D
    );
    this.debugDrawToggleKey = this.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.F
    );

    // Add title text
    const titleText = this.add.text(width / 2, 50, 'Amanda - Phase 3', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    titleText.setOrigin(0.5);
    titleText.setDepth(1000);

    console.log('[WorldScene] Player, walls, NPCs, and interaction system initialized');
  }

  /**
   * Create test NPCs for Phase 3
   */
  private createNpcs(): void {
    const dialogue1: DialogueData = {
      characterName: 'Village Elder',
      lines: [
        'Welcome to our village, traveler!',
        'We are peaceful folk who live in harmony with nature.',
        'Feel free to explore, but beware the forest to the east.',
      ],
    };
    const npc1 = new Npc(this, 200, 300, 'elder', dialogue1, 64, 'Press E to talk');
    this.npcs.push(npc1);

    const dialogue2: DialogueData = {
      characterName: 'Mysterious Stranger',
      lines: [
        '...',
        'You sense a powerful presence nearby.',
        'Perhaps we will meet again...',
      ],
    };
    const npc2 = new Npc(this, 600, 400, 'stranger', dialogue2, 64, 'Press E to talk');
    this.npcs.push(npc2);

    const dialogue3: DialogueData = {
      characterName: 'Shopkeeper',
      lines: [
        'Hello! Would you like to buy something?',
        'Oh wait, I forgot... the shop system is not implemented yet!',
        'Come back in Phase 5!',
      ],
    };
    const npc3 = new Npc(this, 550, 150, 'shopkeeper', dialogue3, 64, 'Press E to talk');
    this.npcs.push(npc3);

    console.log(`[WorldScene] Created ${this.npcs.length} NPCs`);
  }

  /**
   * Check NPC proximity using simple distance calculation
   * NO PHYSICS OVERLAP - manual distance check only
   */
  private checkNpcProximity(): void {
    if (this.dialogueBox.getIsVisible()) return;

    const playerX = this.player.x;
    const playerY = this.player.y;
    const interactionDistance = 50; // pixels

    let closestNpc: Npc | null = null;
    let closestDistance = interactionDistance;

    // Find closest NPC within range
    for (const npc of this.npcs) {
      const promptPos = npc.getPromptPosition();
      const dx = playerX - promptPos.x;
      const dy = playerY - (promptPos.y + 40); // Adjust for prompt offset
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestNpc = npc;
      }
    }

    // Update nearby NPC
    if (closestNpc !== this.nearbyNpc) {
      if (this.nearbyNpc) {
        this.interactionPrompt.hide();
      }
      
      this.nearbyNpc = closestNpc;
      
      if (this.nearbyNpc) {
        const promptPos = this.nearbyNpc.getPromptPosition();
        this.interactionPrompt.show(promptPos.x, promptPos.y, this.nearbyNpc.getPromptText());
      }
    }
  }

  /**
   * Handle E key press for interaction
   */
  private handleInteraction(): void {
    if (!this.inputManager.isInteractJustPressed()) return;

    if (this.dialogueBox.getIsVisible()) {
      const hasMore = this.dialogueBox.advance();
      if (!hasMore) {
        this.player.setDialogueActive(false);
      }
      return;
    }

    if (this.nearbyNpc && this.nearbyNpc.canInteract(this.player)) {
      this.startDialogue(this.nearbyNpc);
    }
  }

  /**
   * Start dialogue with an NPC
   */
  private startDialogue(npc: Npc): void {
    npc.interact(this.player);
    
    const dialogue = npc.getDialogue();
    this.dialogueBox.showDialogue(dialogue);
    this.interactionPrompt.hide();
    this.player.setDialogueActive(true);

    console.log('[WorldScene] Started dialogue with', npc.getInteractionId());
  }

  /**
   * Create test walls for Phase 2
   */
  private createWalls(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const wallThickness = 16;
    const padding = 50;

    this.addWall(padding, padding, width - padding * 2, wallThickness);
    this.addWall(padding, height - padding - wallThickness, width - padding * 2, wallThickness);
    this.addWall(padding, padding, wallThickness, height - padding * 2);
    this.addWall(width - padding - wallThickness, padding, wallThickness, height - padding * 2);
    this.addWall(width / 2 - 32, height / 2 - 32, 64, 64);
    this.addWall(150, 200, 120, wallThickness);
    this.addWall(600, 250, wallThickness, 100);
    this.addWall(300, 400, 80, wallThickness);
    this.addWall(300, 400, wallThickness, 80);
    this.addWall(450, 450, wallThickness, 100);
    this.addWall(500, 450, wallThickness, 100);

    console.log('[WorldScene] Test walls created');
  }

  /**
   * Helper method to add a wall to the scene
   */
  private addWall(x: number, y: number, width: number, height: number): Wall {
    const wall = new Wall(this, x, y, width, height);
    this.wallsGroup.add(wall);
    return wall;
  }

  update(): void {
    if (this.player) {
      this.player.update();
    }

    // Use simple distance checking instead of physics overlap
    this.checkNpcProximity();

    this.handleInteraction();

    if (this.debugDisplay) {
      this.debugDisplay.update();
    }

    if (this.debugDraw) {
      this.debugDraw.update();
    }

    if (Phaser.Input.Keyboard.JustDown(this.debugToggleKey)) {
      this.debugDisplay.toggle();
    }

    if (Phaser.Input.Keyboard.JustDown(this.debugDrawToggleKey)) {
      this.debugDraw.toggle();
    }
  }
}
