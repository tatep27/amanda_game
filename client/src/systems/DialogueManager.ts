import { DialogueData, DialogueCollection } from '@/types';

/**
 * DialogueManager - Loads and manages dialogue content from JSON
 * Phase 5: Data-driven content pipeline
 */
export class DialogueManager {
  private static instance: DialogueManager;
  private dialogues: DialogueCollection = {};
  private loaded: boolean = false;

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): DialogueManager {
    if (!DialogueManager.instance) {
      DialogueManager.instance = new DialogueManager();
    }
    return DialogueManager.instance;
  }

  /**
   * Load all dialogues from JSON file
   */
  async load(): Promise<void> {
    if (this.loaded) {
      console.log('[DialogueManager] Already loaded');
      return;
    }

    try {
      const response = await fetch('/data/dialogues.json');
      
      if (!response.ok) {
        throw new Error(`Failed to load dialogues (${response.status})`);
      }
      
      this.dialogues = await response.json();
      this.loaded = true;
      
      const dialogueCount = Object.keys(this.dialogues).length;
      console.log(`[DialogueManager] Loaded ${dialogueCount} dialogues`);
    } catch (error) {
      console.error('[DialogueManager] Error loading dialogues:', error);
      throw error;
    }
  }

  /**
   * Get dialogue by ID
   */
  getDialogue(dialogueId: string): DialogueData | null {
    if (!this.loaded) {
      console.warn('[DialogueManager] Dialogues not loaded yet');
      return null;
    }

    const dialogue = this.dialogues[dialogueId];
    
    if (!dialogue) {
      console.warn(`[DialogueManager] Dialogue not found: ${dialogueId}`);
      return null;
    }

    return dialogue;
  }

  /**
   * Check if dialogue exists
   */
  hasDialogue(dialogueId: string): boolean {
    return this.loaded && !!this.dialogues[dialogueId];
  }

  /**
   * Get all dialogue IDs
   */
  getAllDialogueIds(): string[] {
    return Object.keys(this.dialogues);
  }

  /**
   * Check if dialogues are loaded
   */
  isLoaded(): boolean {
    return this.loaded;
  }
}

