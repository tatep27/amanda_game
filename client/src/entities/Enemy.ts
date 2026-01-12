import Phaser from 'phaser';
import { EnemyBehavior, PatrolPoints } from '@/types';
import { Player } from '@/entities/Player';

/**
 * Enemy entity with behavior-driven AI
 * Supports patrol, chase, and hazard behaviors
 */
export class Enemy extends Phaser.Physics.Arcade.Sprite {
  private enemyId: string;
  private behavior: EnemyBehavior;
  private speed: number;
  private patrolPoints?: PatrolPoints;
  private currentPatrolTarget: 'a' | 'b' = 'b';
  private readonly PATROL_THRESHOLD = 5; // Distance to consider "reached" patrol point
  private readonly CHASE_RANGE = 250; // Distance to start chasing player

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    id: string,
    behavior: EnemyBehavior,
    speed: number,
    patrolPoints?: PatrolPoints,
    spriteKey: string = 'enemy-placeholder'
  ) {
    // Use actual sprite if available, fallback to placeholder
    const spriteExists = scene.textures.exists(spriteKey);
    const textureKey = spriteExists ? spriteKey : 'enemy-placeholder';
    console.log(`[Enemy] Constructor: spriteKey="${spriteKey}", exists=${spriteExists}, using="${textureKey}"`);
    super(scene, x, y, textureKey);

    this.enemyId = id;
    this.behavior = behavior;
    this.speed = speed;
    this.patrolPoints = patrolPoints;

    // Add to scene
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Configure physics body
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setSize(32, 32);
    body.setOffset(0, 0);

    // Hazards are immovable
    if (behavior === 'hazard') {
      body.setImmovable(true);
      body.moves = false;
    }

    console.log(`[Enemy] Created "${id}" (${behavior}) at (${x}, ${y}) with texture "${textureKey}"`);
  }

  /**
   * Update enemy state and apply behavior
   * Call this every frame from the scene
   */
  update(player: Player): void {
    const body = this.body as Phaser.Physics.Arcade.Body;

    switch (this.behavior) {
      case 'patrol':
        this.updatePatrol(body);
        break;
      case 'chase':
        this.updateChase(body, player);
        break;
      case 'hazard':
        // Hazards don't move
        body.setVelocity(0, 0);
        break;
    }
  }

  /**
   * Patrol behavior: move between two points
   */
  private updatePatrol(body: Phaser.Physics.Arcade.Body): void {
    if (!this.patrolPoints) {
      body.setVelocity(0, 0);
      return;
    }

    // Get current target point
    const target = this.currentPatrolTarget === 'a' 
      ? this.patrolPoints.a 
      : this.patrolPoints.b;

    // Calculate distance to target
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Check if reached target
    if (distance < this.PATROL_THRESHOLD) {
      // Swap target
      this.currentPatrolTarget = this.currentPatrolTarget === 'a' ? 'b' : 'a';
      return;
    }

    // Move toward target
    const angle = Math.atan2(dy, dx);
    body.setVelocity(
      Math.cos(angle) * this.speed,
      Math.sin(angle) * this.speed
    );
  }

  /**
   * Chase behavior: chase player when in range
   */
  private updateChase(body: Phaser.Physics.Arcade.Body, player: Player): void {
    // Calculate distance to player
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Only chase if within range
    if (distance > this.CHASE_RANGE) {
      body.setVelocity(0, 0);
      return;
    }

    // Move toward player
    const angle = Math.atan2(dy, dx);
    body.setVelocity(
      Math.cos(angle) * this.speed,
      Math.sin(angle) * this.speed
    );
  }

  /**
   * Get enemy ID
   */
  getId(): string {
    return this.enemyId;
  }

  /**
   * Get enemy behavior
   */
  getBehavior(): EnemyBehavior {
    return this.behavior;
  }
}

