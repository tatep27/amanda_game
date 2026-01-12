import Phaser from 'phaser';
import { Interactable } from '@/interfaces/Interactable';
import { Player } from '@/entities/Player';
import { DialogueData } from '@/types';

/**
 * NPC (Non-Player Character) entity
 * Simplified: just sprite with separate zone
 */
export class Npc implements Interactable {
  private scene: Phaser.Scene;
  private interactionId: string;
  private sprite: Phaser.GameObjects.Sprite;
  private interactionZone: Phaser.GameObjects.Zone;
  private dialogue: DialogueData;
  private promptText: string;
  private characterName: string;
  private npcX: number;
  private npcY: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    interactionId: string,
    dialogue: DialogueData,
    zoneSize: number = 64,
    spriteKey: string = 'npc-placeholder'
  ) {
    this.scene = scene;
    this.interactionId = interactionId;
    this.dialogue = dialogue;
    this.npcX = x;
    this.npcY = y;

    // Extract character name from dialogue and format prompt
    this.characterName = dialogue.characterName || 'Unknown';
    this.promptText = `[${this.characterName}] Press E to talk`;

    // Create sprite with custom spriteKey if available
    this.sprite = scene.add.sprite(x, y, spriteKey);

    // Create interaction zone - separate from sprite
    this.interactionZone = scene.add.zone(x, y, zoneSize, zoneSize);
    scene.physics.add.existing(this.interactionZone, false);

    // Configure zone body
    const body = this.interactionZone.body as Phaser.Physics.Arcade.Body;
    body.setImmovable(true);
    body.moves = false;

    console.log(`[NPC] Created "${interactionId}" (${this.characterName}) at (${x}, ${y}) with sprite "${spriteKey}"`);
  }

  getPromptText(): string {
    return this.promptText;
  }

  canInteract(player: Player): boolean {
    return true;
  }

  interact(player: Player): void {
    console.log(`[NPC] ${this.interactionId} interacted`);
  }

  getInteractionId(): string {
    return this.interactionId;
  }

  getDialogue(): DialogueData {
    return this.dialogue;
  }

  getInteractionZone(): Phaser.GameObjects.Zone {
    return this.interactionZone;
  }

  getPromptPosition(): { x: number; y: number } {
    return {
      x: this.npcX,
      y: this.npcY - 40,
    };
  }

  setScale(scale: number): void {
    this.sprite.setScale(scale);
  }
}
