import Phaser from 'phaser';
import { MovementInput } from '@/types';

/**
 * Centralized input manager for keyboard controls
 * Handles arrow key state and provides clean API for movement input
 */
export class InputManager {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private interactKey: Phaser.Input.Keyboard.Key;

  constructor(scene: Phaser.Scene) {
    // Set up arrow keys
    this.cursors = scene.input.keyboard!.createCursorKeys();
    
    // Set up E key for interaction (will be used in Phase 3)
    this.interactKey = scene.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.E
    );
  }

  /**
   * Get current movement input state
   */
  getMovementInput(): MovementInput {
    return {
      up: this.cursors.up.isDown,
      down: this.cursors.down.isDown,
      left: this.cursors.left.isDown,
      right: this.cursors.right.isDown,
    };
  }

  /**
   * Check if interact key was just pressed (for Phase 3)
   */
  isInteractJustPressed(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.interactKey);
  }

  /**
   * Check if any movement key is pressed
   */
  isMoving(): boolean {
    const input = this.getMovementInput();
    return input.up || input.down || input.left || input.right;
  }
}

