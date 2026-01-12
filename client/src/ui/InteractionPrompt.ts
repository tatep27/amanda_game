import Phaser from 'phaser';

/**
 * Floating interaction prompt that appears above interactable objects
 * Shows "Press E to talk" or similar text
 */
export class InteractionPrompt {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private background!: Phaser.GameObjects.Rectangle;
  private text!: Phaser.GameObjects.Text;
  private isShowing: boolean = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    // Create container (we'll add text and background dynamically)
    this.container = scene.add.container(0, 0);
    this.container.setDepth(1000);
    this.container.setVisible(false);
    this.container.setAlpha(0);

    // Create initial text and background
    this.rebuildPrompt('Press E');
  }

  /**
   * Rebuild the prompt with new text
   */
  private rebuildPrompt(promptText: string): void {
    // Remove old elements if they exist
    if (this.text) this.text.destroy();
    if (this.background) this.background.destroy();

    // Create text first
    this.text = this.scene.add.text(0, 0, promptText, {
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    this.text.setOrigin(0.5);

    // Measure text accurately
    const padding = 12;
    const boxWidth = this.text.width + padding * 2;
    const boxHeight = this.text.height + padding;

    // Create background sized to text
    this.background = this.scene.add.rectangle(0, 0, boxWidth, boxHeight, 0x000000, 0.7);
    this.background.setStrokeStyle(2, 0xffffff, 0.8);
    this.background.setOrigin(0.5);

    // Add to container (background first, then text on top)
    this.container.removeAll();
    this.container.add([this.background, this.text]);
  }

  /**
   * Show the prompt at a specific position with custom text
   */
  show(x: number, y: number, promptText: string = 'Press E'): void {
    if (this.isShowing) return;
    
    this.isShowing = true;

    // Rebuild with new text
    this.rebuildPrompt(promptText);

    this.container.setPosition(x, y);
    this.container.setVisible(true);
    this.scene.tweens.killTweensOf(this.container);

    this.scene.tweens.add({
      targets: this.container,
      alpha: 1,
      duration: 200,
      ease: 'Power2',
    });
  }

  /**
   * Hide the prompt
   */
  hide(): void {
    if (!this.isShowing) return;
    
    this.isShowing = false;
    this.scene.tweens.killTweensOf(this.container);
    
    this.scene.tweens.add({
      targets: this.container,
      alpha: 0,
      duration: 200,
      ease: 'Power2',
      onComplete: () => {
        this.container.setVisible(false);
      },
    });
  }

  setPosition(x: number, y: number): void {
    this.container.setPosition(x, y);
  }

  isVisible(): boolean {
    return this.container.visible;
  }

  destroy(): void {
    this.scene.tweens.killTweensOf(this.container);
    this.container.destroy();
  }
}
