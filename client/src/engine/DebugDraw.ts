import Phaser from 'phaser';
import { Player } from '@/entities/Player';

/**
 * Debug drawing system for visualizing physics bodies and hitboxes
 * Essential for development and level design
 */
export class DebugDraw {
  private scene: Phaser.Scene;
  private graphics: Phaser.GameObjects.Graphics;
  private enabled: boolean = false;

  // Color constants
  private readonly PLAYER_COLOR = 0x00ff00; // Green
  private readonly WALL_COLOR = 0xff0000; // Red
  private readonly OVERLAP_COLOR = 0xffff00; // Yellow (for NPC zones)
  private readonly DOOR_COLOR = 0x00ffff; // Cyan (for doors - Phase 4)
  private readonly ALPHA = 0.5;
  private readonly LINE_WIDTH = 2;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.graphics = scene.add.graphics();
    this.graphics.setDepth(9999); // Always on top
    console.log('[DebugDraw] Initialized');
  }

  /**
   * Toggle debug draw on/off
   */
  toggle(): void {
    this.enabled = !this.enabled;
    console.log(`[DebugDraw] ${this.enabled ? 'Enabled' : 'Disabled'}`);
    if (!this.enabled) {
      this.graphics.clear();
    }
  }

  /**
   * Check if debug draw is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Set debug draw state
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!this.enabled) {
      this.graphics.clear();
    }
  }

  /**
   * Update debug draw - call this every frame
   */
  update(): void {
    if (!this.enabled) {
      return;
    }

    // Clear previous frame
    this.graphics.clear();

    // Draw all physics bodies in the scene
    this.drawPhysicsBodies();
  }

  /**
   * Draw all physics bodies in the scene
   */
  private drawPhysicsBodies(): void {
    // Get all physics bodies from the scene
    const bodies = this.scene.physics.world.bodies.entries;

    bodies.forEach((body: Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody) => {
      if (!body.enable) return;

      // Determine color based on body type
      let color = this.WALL_COLOR;
      
      if (body.gameObject && body.gameObject instanceof Player) {
        color = this.PLAYER_COLOR;
      } else if (body instanceof Phaser.Physics.Arcade.StaticBody) {
        color = this.WALL_COLOR;
      } else if (body.gameObject && body.gameObject.constructor.name === 'Zone') {
        // Interaction zones (NPC zones) - yellow
        color = this.OVERLAP_COLOR;
      }

      // Draw the body
      this.graphics.lineStyle(this.LINE_WIDTH, color, this.ALPHA);
      this.graphics.strokeRect(body.x, body.y, body.width, body.height);

      // Fill with transparent color
      this.graphics.fillStyle(color, 0.1);
      this.graphics.fillRect(body.x, body.y, body.width, body.height);
    });
  }

  /**
   * Draw a specific body (useful for custom visualizations)
   */
  drawBody(
    body: Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody,
    color: number = this.WALL_COLOR
  ): void {
    if (!this.enabled) return;

    this.graphics.lineStyle(this.LINE_WIDTH, color, this.ALPHA);
    this.graphics.strokeRect(body.x, body.y, body.width, body.height);
    this.graphics.fillStyle(color, 0.1);
    this.graphics.fillRect(body.x, body.y, body.width, body.height);
  }

  /**
   * Draw a rectangle (useful for zones/triggers)
   */
  drawRect(
    x: number,
    y: number,
    width: number,
    height: number,
    color: number = this.OVERLAP_COLOR
  ): void {
    if (!this.enabled) return;

    this.graphics.lineStyle(this.LINE_WIDTH, color, this.ALPHA);
    this.graphics.strokeRect(x, y, width, height);
    this.graphics.fillStyle(color, 0.1);
    this.graphics.fillRect(x, y, width, height);
  }

  /**
   * Draw interaction zones for doors (Phase 4)
   * Call this from scene's update with door positions
   */
  drawDoorZone(x: number, y: number, size: number = 64): void {
    if (!this.enabled) return;

    const halfSize = size / 2;
    this.graphics.lineStyle(this.LINE_WIDTH, this.DOOR_COLOR, this.ALPHA);
    this.graphics.strokeRect(x - halfSize, y - halfSize, size, size);
    this.graphics.fillStyle(this.DOOR_COLOR, 0.1);
    this.graphics.fillRect(x - halfSize, y - halfSize, size, size);
  }

  /**
   * Draw interaction zones for NPCs (Phase 3)
   * Call this from scene's update with NPC positions
   */
  drawNpcZone(x: number, y: number, size: number = 64): void {
    if (!this.enabled) return;

    const halfSize = size / 2;
    this.graphics.lineStyle(this.LINE_WIDTH, this.OVERLAP_COLOR, this.ALPHA);
    this.graphics.strokeRect(x - halfSize, y - halfSize, size, size);
    this.graphics.fillStyle(this.OVERLAP_COLOR, 0.1);
    this.graphics.fillRect(x - halfSize, y - halfSize, size, size);
  }

  /**
   * Clean up
   */
  destroy(): void {
    this.graphics.destroy();
  }
}

