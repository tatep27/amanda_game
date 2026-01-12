import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // Set any global game settings here
    console.log('[BootScene] Booting game...');
  }

  create(): void {
    // Set default background color
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // Configure scale mode (already set in config, but can be adjusted per scene)
    this.scale.on('resize', this.resize, this);

    console.log('[BootScene] Boot complete, starting PreloadScene');
    
    // Immediately transition to PreloadScene
    this.scene.start('PreloadScene');
  }

  private resize(gameSize: Phaser.Structs.Size): void {
    const width = gameSize.width;
    const height = gameSize.height;
    this.cameras.resize(width, height);
  }
}

