import Phaser from 'phaser';

/**
 * Wall/Obstacle entity - static physics body that blocks player movement
 * Represents solid objects like walls, rocks, furniture, etc.
 */
export class Wall extends Phaser.Physics.Arcade.Sprite {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number = 32,
    height: number = 32
  ) {
    // Use the placeholder wall texture created in Phase 1
    super(scene, x, y, 'wall-placeholder');

    // Add to scene
    scene.add.existing(this);
    scene.physics.add.existing(this, true); // true = static body

    // CRITICAL: Set origin BEFORE configuring physics body
    // This ensures body position calculations use correct anchor point
    this.setOrigin(0, 0);

    // Set size
    this.setDisplaySize(width, height);

    // Configure physics body
    const body = this.body as Phaser.Physics.Arcade.StaticBody;
    body.setSize(width, height);
    body.updateFromGameObject();

    console.log(`[Wall] Created at (${x}, ${y}) with size ${width}x${height}`);
  }

  /**
   * Helper to create a horizontal wall
   */
  static createHorizontal(
    scene: Phaser.Scene,
    x: number,
    y: number,
    length: number,
    thickness: number = 16
  ): Wall {
    return new Wall(scene, x, y, length, thickness);
  }

  /**
   * Helper to create a vertical wall
   */
  static createVertical(
    scene: Phaser.Scene,
    x: number,
    y: number,
    length: number,
    thickness: number = 16
  ): Wall {
    return new Wall(scene, x, y, thickness, length);
  }
}
