/**
 * Core type definitions for the game
 */

/**
 * Cardinal directions for player facing and movement
 */
export enum Direction {
  UP = 'up',
  DOWN = 'down',
  LEFT = 'left',
  RIGHT = 'right',
}

/**
 * Input state for movement
 */
export interface MovementInput {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
}

/**
 * 2D velocity vector
 */
export interface Velocity {
  x: number;
  y: number;
}

/**
 * Position in 2D space
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * Obstacle/wall data for scene manifests (Phase 5)
 */
export interface ObstacleData {
  x: number;
  y: number;
  width: number;
  height: number;
  type?: 'wall' | 'rock' | 'furniture' | 'custom';
}

/**
 * Dialogue data structure
 */
export interface DialogueData {
  lines: string[];
  characterName?: string;
  portrait?: string;
}

/**
 * Interaction metadata
 */
export interface InteractionData {
  interactionId: string;
  dialogueId?: string;
  promptText: string;
}

/**
 * NPC data for scene manifests (Phase 5)
 */
export interface NpcData {
  id: string;
  x: number;
  y: number;
  spriteKey: string;
  dialogueId?: string;
  interactionZoneSize?: number;
}

/**
 * Spawn point for player placement in scenes (Phase 4)
 */
export interface SpawnPoint {
  id: string;
  x: number;
  y: number;
  facing?: Direction;
}

/**
 * Door data for scene transitions (Phase 4)
 */
export interface DoorData {
  x: number;
  y: number;
  toSceneKey: string;
  toSpawnId: string;
  promptText?: string;
}

/**
 * Enemy behavior types
 */
export type EnemyBehavior = 'patrol' | 'chase' | 'hazard';

/**
 * Patrol points for patrol behavior
 */
export interface PatrolPoints {
  a: { x: number; y: number };
  b: { x: number; y: number };
}

/**
 * Enemy data for scene manifests
 */
export interface EnemyData {
  id: string;
  x: number;
  y: number;
  spriteKey: string;
  behavior: EnemyBehavior;
  speed: number;
  patrol?: PatrolPoints;
}

/**
 * Collectible data for scene manifests
 */
export interface CollectibleData {
  id: string;
  itemName: string;
  flagKey: string; // GameState flag to set when collected
  x: number;
  y: number;
  sprite?: string; // Optional custom sprite
}

/**
 * Scene initialization data (Phase 4)
 */
export interface SceneInitData {
  spawnId?: string;
}

/**
 * Scene manifest for data-driven scenes (Phase 5)
 */
export interface SceneManifest {
  sceneKey: string;
  name: string;
  backgroundColor: string;
  introMessage?: string;
  spawns: SpawnPoint[];
  walls: ObstacleData[];
  npcs: NpcData[];
  doors: DoorData[];
  enemies: EnemyData[];
  collectibles?: CollectibleData[];
}

/**
 * Dialogue collection (Phase 5)
 */
export interface DialogueCollection {
  [dialogueId: string]: DialogueData;
}

