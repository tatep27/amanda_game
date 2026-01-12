import Phaser from 'phaser';
import { Interactable } from '@/interfaces/Interactable';
import { Player } from '@/entities/Player';

/**
 * Door entity for scene transitions (Phase 4)
 * Simple sprite with transition metadata
 */
export class Door implements Interactable {
  private interactionId: string;
  private doorX: number;
  private doorY: number;
  private toSceneKey: string;
  private toSpawnId: string;
  private promptText: string;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    interactionId: string,
    toSceneKey: string,
    toSpawnId: string,
    promptText: string = 'Press E to enter'
  ) {
    this.interactionId = interactionId;
    this.doorX = x;
    this.doorY = y;
    this.toSceneKey = toSceneKey;
    this.toSpawnId = toSpawnId;
    this.promptText = promptText;

    // Create door sprite (not stored as we don't need to reference it)
    scene.add.sprite(x, y, 'door-placeholder');

    console.log(`[Door] Created "${interactionId}" at (${x}, ${y}) -> ${toSceneKey}:${toSpawnId}`);
  }

  getPromptText(): string {
    return this.promptText;
  }

  canInteract(_player: Player): boolean {
    return true;
  }

  interact(_player: Player): void {
    console.log(`[Door] ${this.interactionId} interacted - transitioning to ${this.toSceneKey}`);
  }

  getInteractionId(): string {
    return this.interactionId;
  }

  /**
   * Get the scene key this door leads to
   */
  getToSceneKey(): string {
    return this.toSceneKey;
  }

  /**
   * Get the spawn ID in the target scene
   */
  getToSpawnId(): string {
    return this.toSpawnId;
  }

  /**
   * Get the door position
   */
  getPosition(): { x: number; y: number } {
    return { x: this.doorX, y: this.doorY };
  }

  /**
   * Get the prompt position (above the door)
   */
  getPromptPosition(): { x: number; y: number } {
    return {
      x: this.doorX,
      y: this.doorY - 30,
    };
  }
}

