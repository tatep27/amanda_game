import Phaser from 'phaser';
import { Player } from '@/entities/Player';

/**
 * Debug display overlay for development
 * Shows player state, velocity, and other debug info
 */
export class DebugDisplay {
  private scene: Phaser.Scene;
  private player: Player;
  private debugText!: Phaser.GameObjects.Text;
  private enabled: boolean = true;

  constructor(scene: Phaser.Scene, player: Player) {
    this.scene = scene;
    this.player = player;
    this.createDebugText();
  }

  private createDebugText(): void {
    const style: Phaser.Types.GameObjects.Text.TextStyle = {
      fontSize: '14px',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 8, y: 8 },
      fontFamily: 'monospace',
    };

    this.debugText = this.scene.add.text(10, 10, '', style);
    this.debugText.setDepth(10000); // Always on top
    this.debugText.setScrollFactor(0); // Fixed to camera
  }

  /**
   * Update debug display - call this every frame
   */
  update(): void {
    if (!this.enabled) {
      this.debugText.setVisible(false);
      return;
    }

    this.debugText.setVisible(true);

    const velocity = this.player.getVelocity();
    const facing = this.player.getFacingDirection();
    const isMoving = this.player.getIsMoving();
    const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);

    const debugInfo = [
      'DEBUG INFO',
      '─────────────────────',
      `Position: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`,
      `Velocity: (${Math.round(velocity.x)}, ${Math.round(velocity.y)})`,
      `Speed: ${Math.round(speed)} px/s`,
      `Facing: ${facing}`,
      `Moving: ${isMoving ? 'YES' : 'NO'}`,
      '─────────────────────',
      'Controls: Arrow Keys',
      'Toggle Debug: D',
    ];

    this.debugText.setText(debugInfo);
  }

  /**
   * Toggle debug display on/off
   */
  toggle(): void {
    this.enabled = !this.enabled;
  }

  /**
   * Check if debug display is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }
}

