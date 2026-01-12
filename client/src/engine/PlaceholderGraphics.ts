import Phaser from 'phaser';
import { Direction } from '@/types';

/**
 * Utility class to create placeholder graphics for game entities
 * These will be replaced with real artwork from iPad later
 */
export class PlaceholderGraphics {
  /**
   * Create a placeholder player texture with directional indicator
   * Note: Only used if custom player sprite is not loaded
   */
  static createPlayerTexture(scene: Phaser.Scene): void {
    // Skip if custom player textures exist (animation frames) or placeholders already created
    if (scene.textures.exists('player_starting') || 
        scene.textures.exists('player_mouth_starting') ||
        scene.textures.exists('player-placeholder')) {
      console.log('[PlaceholderGraphics] Player texture exists, skipping placeholder creation');
      return;
    }
    
    const size = 32;
    const graphics = scene.add.graphics();

    // Create textures for each direction with simple triangle indicators
    const directions = [
      { 
        key: 'player-down', 
        color: 0x4ade80, 
        triangle: { tip: [16, 24], base1: [8, 12], base2: [24, 12] } // Points down
      },
      { 
        key: 'player-up', 
        color: 0x60a5fa, 
        triangle: { tip: [16, 8], base1: [8, 20], base2: [24, 20] } // Points up
      },
      { 
        key: 'player-left', 
        color: 0xf472b6, 
        triangle: { tip: [8, 16], base1: [20, 8], base2: [20, 24] } // Points left
      },
      { 
        key: 'player-right', 
        color: 0xfbbf24, 
        triangle: { tip: [24, 16], base1: [12, 8], base2: [12, 24] } // Points right
      },
    ];

    directions.forEach(({ key, color, triangle }) => {
      graphics.clear();

      // Draw player body (rounded rectangle)
      graphics.fillStyle(color, 1);
      graphics.fillRoundedRect(0, 0, size, size, 4);

      // Draw directional indicator (triangle)
      graphics.fillStyle(0xffffff, 1);
      graphics.fillTriangle(
        triangle.tip[0], triangle.tip[1],
        triangle.base1[0], triangle.base1[1],
        triangle.base2[0], triangle.base2[1]
      );

      // Generate texture from graphics
      graphics.generateTexture(key, size, size);
    });

    // Create the default player placeholder texture (facing down)
    graphics.clear();
    graphics.fillStyle(0x4ade80, 1);
    graphics.fillRoundedRect(0, 0, size, size, 4);
    graphics.fillStyle(0xffffff, 1);
    graphics.fillTriangle(size / 2, size - 8, 8, 8, size - 8, 8);
    graphics.generateTexture('player-placeholder', size, size);

    // Clean up graphics object
    graphics.destroy();

    console.log('[PlaceholderGraphics] Created player placeholder textures');
  }

  /**
   * Update player texture based on facing direction
   * Note: Only used for placeholder graphics, not custom sprites with rotation
   */
  static updatePlayerTexture(sprite: Phaser.Physics.Arcade.Sprite, direction: Direction): void {
    const textureKey = `player-${direction}`;
    if (sprite.scene.textures.exists(textureKey)) {
      sprite.setTexture(textureKey);
    }
  }

  /**
   * Create a simple wall/obstacle texture
   */
  static createWallTexture(scene: Phaser.Scene): void {
    // Skip if texture already exists
    if (scene.textures.exists('wall-placeholder')) {
      console.log('[PlaceholderGraphics] Wall texture already exists, skipping');
      return;
    }
    
    const size = 32;
    const graphics = scene.add.graphics();

    graphics.fillStyle(0x334155, 1);
    graphics.fillRect(0, 0, size, size);
    graphics.lineStyle(2, 0x475569, 1);
    graphics.strokeRect(0, 0, size, size);

    graphics.generateTexture('wall-placeholder', size, size);
    graphics.destroy();

    console.log('[PlaceholderGraphics] Created wall texture');
  }

  /**
   * Create an NPC placeholder texture
   */
  static createNpcTexture(scene: Phaser.Scene): void {
    // Skip if texture already exists
    if (scene.textures.exists('npc-placeholder')) {
      console.log('[PlaceholderGraphics] NPC texture already exists, skipping');
      return;
    }
    
    const size = 32;
    const graphics = scene.add.graphics();

    graphics.fillStyle(0xa78bfa, 1);
    graphics.fillCircle(size / 2, size / 2, size / 2 - 2);
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(size / 2 - 6, size / 2 - 4, 3);
    graphics.fillCircle(size / 2 + 6, size / 2 - 4, 3);

    graphics.generateTexture('npc-placeholder', size, size);
    graphics.destroy();

    console.log('[PlaceholderGraphics] Created NPC texture');
  }

  /**
   * Create a door placeholder texture (Phase 4)
   */
  static createDoorTexture(scene: Phaser.Scene): void {
    // Skip if texture already exists
    if (scene.textures.exists('door-placeholder')) {
      console.log('[PlaceholderGraphics] Door texture already exists, skipping');
      return;
    }
    
    const width = 32;
    const height = 48;
    const graphics = scene.add.graphics();

    // Door body (green rectangle)
    graphics.fillStyle(0x10b981, 1);
    graphics.fillRect(0, 0, width, height);
    
    // Door frame
    graphics.lineStyle(2, 0x059669, 1);
    graphics.strokeRect(0, 0, width, height);
    
    // Door handle
    graphics.fillStyle(0xfbbf24, 1);
    graphics.fillCircle(width - 8, height / 2, 3);

    graphics.generateTexture('door-placeholder', width, height);
    graphics.destroy();

    console.log('[PlaceholderGraphics] Created door texture');
  }

  /**
   * Create an enemy placeholder texture
   */
  static createEnemyTexture(scene: Phaser.Scene): void {
    // Skip if texture already exists
    if (scene.textures.exists('enemy-placeholder')) {
      console.log('[PlaceholderGraphics] Enemy texture already exists, skipping');
      return;
    }
    
    const size = 32;
    const graphics = scene.add.graphics();

    // Enemy body (red diamond/rhombus)
    graphics.fillStyle(0xef4444, 1);
    graphics.beginPath();
    graphics.moveTo(size / 2, 0);
    graphics.lineTo(size, size / 2);
    graphics.lineTo(size / 2, size);
    graphics.lineTo(0, size / 2);
    graphics.closePath();
    graphics.fillPath();
    
    // Enemy outline
    graphics.lineStyle(2, 0x991b1b, 1);
    graphics.strokePath();
    
    // Enemy eyes (white dots)
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(size / 2 - 6, size / 2 - 2, 3);
    graphics.fillCircle(size / 2 + 6, size / 2 - 2, 3);

    graphics.generateTexture('enemy-placeholder', size, size);
    graphics.destroy();

    console.log('[PlaceholderGraphics] Created enemy texture');
  }

  /**
   * Create a collectible placeholder texture
   */
  static createCollectibleTexture(scene: Phaser.Scene): void {
    // Skip if texture already exists
    if (scene.textures.exists('collectible-placeholder')) {
      console.log('[PlaceholderGraphics] Collectible texture already exists, skipping');
      return;
    }
    
    const size = 32;
    const graphics = scene.add.graphics();

    // Collectible body (yellow star/sparkle)
    graphics.fillStyle(0xfbbf24, 1);
    
    // Draw a simple 4-point star
    const centerX = size / 2;
    const centerY = size / 2;
    const outerRadius = size / 2 - 2;
    const innerRadius = size / 4;
    
    graphics.beginPath();
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4 - Math.PI / 2;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      if (i === 0) {
        graphics.moveTo(x, y);
      } else {
        graphics.lineTo(x, y);
      }
    }
    graphics.closePath();
    graphics.fillPath();
    
    // Outline
    graphics.lineStyle(2, 0xf59e0b, 1);
    graphics.strokePath();
    
    // Center sparkle (white dot)
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(centerX, centerY, 4);

    graphics.generateTexture('collectible-placeholder', size, size);
    graphics.destroy();

    console.log('[PlaceholderGraphics] Created collectible texture');
  }
}

