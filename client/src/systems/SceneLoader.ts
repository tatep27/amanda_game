import Phaser from 'phaser';
import { SceneManifest, SpawnPoint, ObstacleData, NpcData, DoorData, Direction, DialogueData, EnemyData, CollectibleData } from '@/types';
import { Wall } from '@/entities/Wall';
import { Npc } from '@/entities/Npc';
import { Door } from '@/entities/Door';
import { Enemy } from '@/entities/Enemy';
import { Collectible } from '@/entities/Collectible';
import { Player } from '@/entities/Player';
import { GameState } from '@/systems/GameState';

/**
 * SceneLoader - Loads scene manifests from JSON and creates entities
 * Phase 5: Data-driven content pipeline
 */
export class SceneLoader {
  /**
   * Load a scene manifest from JSON file
   */
  static async loadScene(sceneKey: string): Promise<SceneManifest> {
    try {
      const response = await fetch(`/data/scenes/${sceneKey.toLowerCase()}.json`);
      
      if (!response.ok) {
        throw new Error(`Failed to load scene: ${sceneKey} (${response.status})`);
      }
      
      const manifest: SceneManifest = await response.json();
      
      console.log(`[SceneLoader] Loaded scene manifest: ${sceneKey}`);
      return manifest;
    } catch (error) {
      console.error(`[SceneLoader] Error loading scene ${sceneKey}:`, error);
      throw error;
    }
  }

  /**
   * Get spawn points from manifest as a Map
   */
  static getSpawnMap(manifest: SceneManifest): Map<string, SpawnPoint> {
    const spawns = new Map<string, SpawnPoint>();
    
    for (const spawn of manifest.spawns) {
      spawns.set(spawn.id, spawn);
    }
    
    console.log(`[SceneLoader] Loaded ${spawns.size} spawn points`);
    return spawns;
  }

  /**
   * Create walls from manifest data
   */
  static createWalls(
    scene: Phaser.Scene,
    walls: ObstacleData[]
  ): Wall[] {
    const createdWalls: Wall[] = [];
    
    for (const wallData of walls) {
      const wall = new Wall(scene, wallData.x, wallData.y, wallData.width, wallData.height);
      createdWalls.push(wall);
    }
    
    console.log(`[SceneLoader] Created ${createdWalls.length} walls`);
    return createdWalls;
  }

  /**
   * Create NPCs from manifest data
   * Loads dialogues from cache
   */
  static createNpcs(
    scene: Phaser.Scene,
    npcs: NpcData[]
  ): Npc[] {
    const createdNpcs: Npc[] = [];
    const dialogues = scene.cache.json.get('dialogues');
    
    for (const npcData of npcs) {
      if (!npcData.dialogueId) {
        console.warn(`[SceneLoader] NPC ${npcData.id} has no dialogueId`);
        continue;
      }
      
      const dialogue = dialogues?.[npcData.dialogueId];
      if (!dialogue) {
        console.warn(`[SceneLoader] Dialogue not found: ${npcData.dialogueId}`);
        continue;
      }
      
      // Use actual sprite if available
      const spriteKey = npcData.spriteKey && scene.textures.exists(npcData.spriteKey) 
        ? npcData.spriteKey 
        : 'npc-placeholder';
      
      const npc = new Npc(
        scene,
        npcData.x,
        npcData.y,
        npcData.id,
        dialogue,
        npcData.interactionZoneSize || 64,
        spriteKey
      );
      createdNpcs.push(npc);
    }
    
    console.log(`[SceneLoader] Created ${createdNpcs.length} NPCs`);
    return createdNpcs;
  }

  /**
   * Create doors from manifest data
   */
  static createDoors(scene: Phaser.Scene, doors: DoorData[]): Door[] {
    const createdDoors: Door[] = [];
    
    for (const doorData of doors) {
      const door = new Door(
        scene,
        doorData.x,
        doorData.y,
        `door_${doorData.toSceneKey}_${doorData.toSpawnId}`,
        doorData.toSceneKey,
        doorData.toSpawnId,
        doorData.promptText || 'Press E to enter'
      );
      createdDoors.push(door);
    }
    
    console.log(`[SceneLoader] Created ${createdDoors.length} doors`);
    return createdDoors;
  }

  /**
   * Create enemies from manifest data
   */
  static createEnemies(scene: Phaser.Scene, enemies: EnemyData[], player: Player): Enemy[] {
    const createdEnemies: Enemy[] = [];
    
    for (const enemyData of enemies) {
      const spriteKey = enemyData.spriteKey || 'enemy-placeholder';
      const enemy = new Enemy(
        scene,
        enemyData,
        player
      );
      createdEnemies.push(enemy);
    }
    
    console.log(`[SceneLoader] Created ${createdEnemies.length} enemies`);
    return createdEnemies;
  }

  /**
   * Create collectibles from manifest data
   */
  static createCollectibles(
    scene: Phaser.Scene,
    collectiblesData: CollectibleData[] | undefined,
    player: Player
  ): Collectible[] {
    if (!collectiblesData) return [];
    
    const createdCollectibles: Collectible[] = [];
    const gameState = GameState.getInstance();
    
    for (const data of collectiblesData) {
      // Skip if already collected
      if (gameState.hasFlag(data.flagKey)) {
        console.log(`[SceneLoader] Skipping already collected: ${data.id}`);
        continue;
      }
      
      // Special callback for mouth collectible
      let onCollect: ((player: Player) => void) | undefined;
      if (data.id === 'mouth_item' || data.flagKey === 'collected_mouth') {
        onCollect = (player: Player) => {
          console.log('[SceneLoader] Mouth collected! Switching player to static mouth sprite');
          player.switchToMouthSprite();
        };
      }
      
      const collectible = new Collectible(
        scene,
        data.x,
        data.y,
        data.id,
        data.itemName,
        data.flagKey,
        data.sprite || 'collectible-placeholder',
        onCollect
      );
      createdCollectibles.push(collectible);
    }
    
    console.log(`[SceneLoader] Created ${createdCollectibles.length} collectibles`);
    return createdCollectibles;
  }

  /**
   * Parse background color string to number
   */
  static parseBackgroundColor(colorString: string): number {
    // Handle hex strings like "0x2a2a4e" or "#2a2a4e"
    if (colorString.startsWith('0x')) {
      return parseInt(colorString, 16);
    } else if (colorString.startsWith('#')) {
      return parseInt(colorString.substring(1), 16);
    }
    return parseInt(colorString, 16);
  }
}

