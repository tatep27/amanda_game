import Phaser from 'phaser';
import { Interactable } from '@/interfaces/Interactable';
import { Player } from '@/entities/Player';
import { GameState } from '@/systems/GameState';

/**
 * Collectible entity that can be picked up by the player
 * Implements Interactable for consistent interaction API
 */
export class Collectible extends Phaser.Physics.Arcade.Sprite implements Interactable {
  private collectibleId: string;
  private itemName: string;
  private flagKey: string; // GameState flag to set when collected
  private onCollect?: (player: Player) => void; // Optional callback
  private isCollected: boolean = false;
  
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    id: string,
    itemName: string,
    flagKey: string,
    spriteKey: string = 'collectible-placeholder',
    onCollect?: (player: Player) => void
  ) {
    // Use actual sprite if available, fallback to placeholder
    const textureKey = scene.textures.exists(spriteKey) ? spriteKey : 'collectible-placeholder';
    super(scene, x, y, textureKey);

    this.collectibleId = id;
    this.itemName = itemName;
    this.flagKey = flagKey;
    this.onCollect = onCollect;

    // Add to scene
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Configure physics body - static collectible
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setImmovable(true);
    body.moves = false;
    body.setSize(32, 32);
    body.setOffset(0, 0);

    console.log(`[Collectible] Created "${id}" (${itemName}) at (${x}, ${y})`);
  }

  /**
   * Get the prompt text to display when player is in range
   */
  getPromptText(): string {
    return `Press E to collect ${this.itemName}`;
  }

  /**
   * Check if this collectible can be interacted with right now
   */
  canInteract(_player: Player): boolean {
    return !this.isCollected;
  }

  /**
   * Trigger the interaction - collect the item
   */
  interact(player: Player): void {
    if (this.isCollected) return;

    console.log(`[Collectible] Player collected ${this.itemName}`);
    
    // Mark as collected
    this.isCollected = true;

    // Set GameState flag
    const gameState = GameState.getInstance();
    gameState.setFlag(this.flagKey, true);

    // Call callback if provided
    if (this.onCollect) {
      this.onCollect(player);
    }

    // Destroy this sprite with fade effect
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scale: 1.5,
      duration: 300,
      onComplete: () => {
        this.destroy();
      }
    });
  }

  /**
   * Get the unique identifier for this collectible
   */
  getInteractionId(): string {
    return this.collectibleId;
  }

  /**
   * Get the position where the prompt should be displayed (above the collectible)
   */
  getPromptPosition(): { x: number; y: number } {
    return {
      x: this.x,
      y: this.y - 30,
    };
  }

  /**
   * Get the actual position of the collectible
   */
  getPosition(): { x: number; y: number } {
    return {
      x: this.x,
      y: this.y,
    };
  }
}

