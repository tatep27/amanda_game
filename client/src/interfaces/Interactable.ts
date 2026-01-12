import { Player } from '@/entities/Player';

/**
 * Interface for all interactive objects (NPCs, doors, items, etc.)
 * Ensures consistent interaction API across different entity types
 */
export interface Interactable {
  /**
   * Get the prompt text to display when player is in range
   * @returns String like "Press E to talk" or "Press E to open"
   */
  getPromptText(): string;

  /**
   * Check if this interactable can be interacted with right now
   * @param player The player attempting to interact
   * @returns true if interaction is allowed, false otherwise
   */
  canInteract(player: Player): boolean;

  /**
   * Trigger the interaction
   * @param player The player interacting
   * @returns The interaction result (dialogue ID, scene transition, etc.)
   */
  interact(player: Player): void;

  /**
   * Get the unique identifier for this interactable
   * @returns Interaction ID string
   */
  getInteractionId(): string;
}

