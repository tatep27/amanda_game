import Phaser from 'phaser';
import { Direction, MovementInput, Velocity } from '@/types';
import { InputManager } from '@/engine/InputManager';
import { GameState } from '@/systems/GameState';

/**
 * Player character with movement, facing direction, and animation
 */
export class Player extends Phaser.Physics.Arcade.Sprite {
  private static readonly MOVEMENT_SPEED = 160; // pixels per second
  private static readonly DIAGONAL_FACTOR = 0.7071; // 1/√2 for normalized diagonal movement
  private static readonly SPRITE_SCALE = 1 / 30; // Scale down sprites from iPad exports

  private inputManager: InputManager;
  private currentDirection: Direction;
  private isMoving: boolean;
  private dialogueActive: boolean = false; // Phase 3: Track if in dialogue

  constructor(scene: Phaser.Scene, x: number, y: number, inputManager: InputManager) {
    const gameState = GameState.getInstance();
    const hasMouth = gameState.hasFlag('collected_mouth');
    
    // Use appropriate texture based on game state
    // If has mouth: use static mouth sprite, otherwise use mouthless sprite
    const initialTexture = hasMouth ? 'player_mouth_still' : 'player_starting';
    super(scene, x, y, initialTexture);

    this.inputManager = inputManager;
    this.currentDirection = Direction.UP; // Start facing up (default sprite orientation)
    this.isMoving = false;

    // Add to scene
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // Scale down the sprite (iPad exports are large)
    this.setScale(Player.SPRITE_SCALE);

    // Configure physics body
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true); // Can't leave the screen
    
    // Get original texture dimensions
    const textureWidth = this.texture.getSourceImage().width;
    const textureHeight = this.texture.getSourceImage().height;
    
    // Use the FULL texture as the collision box (it will scale with the sprite)
    // This way the collision box matches the visible sprite after scaling
    body.setSize(textureWidth, textureHeight);
    body.setOffset(0, 0);
    
    // Set initial rotation to face up (0 degrees)
    this.setAngle(0);

    // No animation by default - just static sprite
    if (hasMouth) {
      console.log('[Player] Using static mouth sprite');
    } else {
      console.log('[Player] Using static mouthless sprite');
    }

    const scaledWidth = textureWidth * Player.SPRITE_SCALE;
    const scaledHeight = textureHeight * Player.SPRITE_SCALE;
    console.log('[Player] Collision setup - original texture:', textureWidth, 'x', textureHeight, 
                'scaled to:', scaledWidth, 'x', scaledHeight);
  }

  /**
   * Update player state - called every frame
   */
  update(): void {
    this.handleMovement();
    this.updateVisuals();
  }

  /**
   * Handle movement based on input
   */
  private handleMovement(): void {
    const input = this.inputManager.getMovementInput();
    
    // Disable movement during dialogue
    if (this.dialogueActive) {
      const body = this.body as Phaser.Physics.Arcade.Body;
      body.setVelocity(0, 0);
      this.isMoving = false;
      return;
    }
    
    const velocity = this.calculateVelocity(input);

    // Apply velocity to physics body
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(velocity.x, velocity.y);

    // Update facing direction if moving
    if (velocity.x !== 0 || velocity.y !== 0) {
      this.isMoving = true;
      this.updateFacingDirection(input);
    } else {
      this.isMoving = false;
    }
  }

  /**
   * Calculate velocity from input with diagonal normalization
   */
  private calculateVelocity(input: MovementInput): Velocity {
    let vx = 0;
    let vy = 0;

    // Calculate raw velocity
    if (input.left) vx -= 1;
    if (input.right) vx += 1;
    if (input.up) vy -= 1;
    if (input.down) vy += 1;

    // Normalize diagonal movement (prevent faster diagonal speed)
    if (vx !== 0 && vy !== 0) {
      vx *= Player.DIAGONAL_FACTOR;
      vy *= Player.DIAGONAL_FACTOR;
    }

    // Apply movement speed
    return {
      x: vx * Player.MOVEMENT_SPEED,
      y: vy * Player.MOVEMENT_SPEED,
    };
  }

  /**
   * Update facing direction based on movement input
   * Priority: vertical movement takes precedence if both axes pressed
   */
  private updateFacingDirection(input: MovementInput): void {
    // Prioritize vertical movement for facing direction
    if (input.up) {
      this.currentDirection = Direction.UP;
    } else if (input.down) {
      this.currentDirection = Direction.DOWN;
    } else if (input.left) {
      this.currentDirection = Direction.LEFT;
    } else if (input.right) {
      this.currentDirection = Direction.RIGHT;
    }
  }

  /**
   * Update visual appearance based on state
   * Uses rotation to face the correct direction
   */
  private updateVisuals(): void {
    // Update rotation based on facing direction
    switch (this.currentDirection) {
      case Direction.UP:
        this.setAngle(0); // Default sprite faces up
        break;
      case Direction.RIGHT:
        this.setAngle(90);
        break;
      case Direction.DOWN:
        this.setAngle(180);
        break;
      case Direction.LEFT:
        this.setAngle(270);
        break;
    }
  }

  /**
   * Get current facing direction
   */
  getFacingDirection(): Direction {
    return this.currentDirection;
  }

  /**
   * Check if player is currently moving
   */
  getIsMoving(): boolean {
    return this.isMoving;
  }

  /**
   * Get current velocity for debugging
   */
  getVelocity(): Velocity {
    const body = this.body as Phaser.Physics.Arcade.Body;
    return {
      x: body.velocity.x,
      y: body.velocity.y,
    };
  }

  /**
   * Set dialogue active state (disables movement during dialogue)
   */
  setDialogueActive(active: boolean): void {
    this.dialogueActive = active;
    console.log('[Player] Dialogue active:', active);
  }

  /**
   * Check if dialogue is currently active
   */
  isDialogueActive(): boolean {
    return this.dialogueActive;
  }

  /**
   * Check if player has collected the mouth
   */
  hasMouth(): boolean {
    return GameState.getInstance().hasFlag('collected_mouth');
  }

  /**
   * Switch to mouth sprite (after collecting mouth)
   * This is called when the mouth collectible is picked up
   * Just switches to the static mouth sprite, no animation
   */
  public switchToMouthSprite(): void {
    console.log('[Player] Switching to mouth sprite (static)');
    
    // Switch texture to static mouth version
    this.setTexture('player_mouth_still');
    
    // Maintain current rotation
    this.updateVisuals();
  }

  /**
   * Check for nearby interactable (within interaction range)
   */
  getNearbyInteractable(interactables: Interactable[]): Interactable | null {
    const INTERACTION_RANGE = 64;
    
    for (const interactable of interactables) {
      const position = interactable.getPromptPosition();
      const distance = Phaser.Math.Distance.Between(
        this.x,
        this.y,
        position.x,
        position.y
      );
      
      if (distance <= INTERACTION_RANGE) {
        return interactable;
      }
    }
    
    return null;
  }

  /**
   * Try to interact with nearby interactables
   */
  tryInteract(interactables: Interactable[]): Interactable | null {
    const nearby = this.getNearbyInteractable(interactables);
    if (nearby && nearby.canInteract(this)) {
      nearby.interact(this);
      return nearby;
    }
    return null;
  }
}
