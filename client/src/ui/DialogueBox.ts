import Phaser from 'phaser';
import { DialogueData } from '@/types';

/**
 * Dialogue box UI component
 * Displays character dialogue at the bottom of the screen
 */
export class DialogueBox {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private background: Phaser.GameObjects.Rectangle;
  private nameText: Phaser.GameObjects.Text;
  private dialogueText: Phaser.GameObjects.Text;
  private continueText: Phaser.GameObjects.Text;
  
  private currentDialogue: DialogueData | null = null;
  private currentLineIndex: number = 0;
  private isVisible: boolean = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    const width = scene.cameras.main.width;
    const height = scene.cameras.main.height;
    
    // Position at bottom of screen
    const boxHeight = 150;
    const boxY = height - boxHeight / 2 - 20;

    // Create background
    this.background = scene.add.rectangle(
      width / 2,
      boxY,
      width - 100,
      boxHeight,
      0x000000,
      0.85
    );
    this.background.setStrokeStyle(3, 0xffffff, 0.9);

    // Create character name text
    this.nameText = scene.add.text(60, boxY - boxHeight / 2 + 15, '', {
      fontSize: '20px',
      color: '#ffd700',
      fontStyle: 'bold',
    });

    // Create dialogue text
    this.dialogueText = scene.add.text(60, boxY - boxHeight / 2 + 45, '', {
      fontSize: '18px',
      color: '#ffffff',
      wordWrap: { width: width - 180 },
    });

    // Create continue indicator
    this.continueText = scene.add.text(width - 120, boxY + boxHeight / 2 - 20, 'Press E ▼', {
      fontSize: '14px',
      color: '#cccccc',
      fontStyle: 'italic',
    });

    // Pulsing animation for continue text
    scene.tweens.add({
      targets: this.continueText,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Create container
    this.container = scene.add.container(0, 0, [
      this.background,
      this.nameText,
      this.dialogueText,
      this.continueText,
    ]);
    this.container.setDepth(11000); // Above black overlay (which is 10000)
    this.container.setScrollFactor(0); // Keep anchored to screen, not world
    this.container.setVisible(false);

    console.log('[DialogueBox] Created');
  }

  /**
   * Start showing dialogue
   */
  showDialogue(dialogue: DialogueData): void {
    this.currentDialogue = dialogue;
    this.currentLineIndex = 0;
    this.isVisible = true;
    
    // Set character name
    if (dialogue.characterName) {
      this.nameText.setText(dialogue.characterName);
      this.nameText.setVisible(true);
    } else {
      this.nameText.setVisible(false);
    }

    // Show first line
    this.displayCurrentLine();
    
    // Show container
    this.container.setVisible(true);
    this.container.setAlpha(0);
    
    // Fade in
    this.scene.tweens.add({
      targets: this.container,
      alpha: 1,
      duration: 300,
      ease: 'Power2',
    });

    console.log('[DialogueBox] Showing dialogue:', dialogue.characterName || 'Unknown');
  }

  /**
   * Advance to next line or close if at end
   * @returns true if there are more lines, false if dialogue is complete
   */
  advance(): boolean {
    if (!this.currentDialogue) return false;

    this.currentLineIndex++;

    if (this.currentLineIndex < this.currentDialogue.lines.length) {
      // More lines to show
      this.displayCurrentLine();
      return true;
    } else {
      // Dialogue complete
      this.hide();
      return false;
    }
  }

  /**
   * Display the current dialogue line
   */
  private displayCurrentLine(): void {
    if (!this.currentDialogue) return;

    const line = this.currentDialogue.lines[this.currentLineIndex];
    this.dialogueText.setText(line);

    // Update continue indicator
    const isLastLine = this.currentLineIndex === this.currentDialogue.lines.length - 1;
    this.continueText.setText(isLastLine ? 'Press E to close' : 'Press E ▼');
  }

  /**
   * Hide the dialogue box
   */
  hide(): void {
    // Fade out
    this.scene.tweens.add({
      targets: this.container,
      alpha: 0,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        this.container.setVisible(false);
        this.isVisible = false;
        this.currentDialogue = null;
        this.currentLineIndex = 0;
        console.log('[DialogueBox] Hidden');
      },
    });
  }

  /**
   * Check if dialogue box is currently visible
   */
  getIsVisible(): boolean {
    return this.isVisible;
  }

  /**
   * Check if there's active dialogue
   */
  hasActiveDialogue(): boolean {
    return this.currentDialogue !== null;
  }

  /**
   * Clean up
   */
  destroy(): void {
    this.container.destroy();
  }
}

