/**
 * GameState - Manages game flags and progress tracking
 * Phase 5: Simple flag-based state management
 */
export class GameState {
  private static instance: GameState;
  private flags: Map<string, boolean> = new Map();

  private constructor() {
    console.log('[GameState] Initialized');
  }

  /**
   * Get singleton instance
   */
  static getInstance(): GameState {
    if (!GameState.instance) {
      GameState.instance = new GameState();
    }
    return GameState.instance;
  }

  /**
   * Set a flag value
   */
  setFlag(key: string, value: boolean): void {
    this.flags.set(key, value);
    console.log(`[GameState] Flag set: ${key} = ${value}`);
  }

  /**
   * Get a flag value (defaults to false if not set)
   */
  getFlag(key: string): boolean {
    return this.flags.get(key) || false;
  }

  /**
   * Check if a flag is set to true
   */
  hasFlag(key: string): boolean {
    return this.getFlag(key) === true;
  }

  /**
   * Remove a flag
   */
  clearFlag(key: string): void {
    this.flags.delete(key);
    console.log(`[GameState] Flag cleared: ${key}`);
  }

  /**
   * Clear all flags
   */
  clearAllFlags(): void {
    this.flags.clear();
    console.log('[GameState] All flags cleared');
  }

  /**
   * Get all flags as an object
   */
  getAllFlags(): Record<string, boolean> {
    const obj: Record<string, boolean> = {};
    this.flags.forEach((value, key) => {
      obj[key] = value;
    });
    return obj;
  }

  /**
   * Load flags from an object (for save/load later)
   */
  loadFlags(flags: Record<string, boolean>): void {
    this.flags.clear();
    Object.entries(flags).forEach(([key, value]) => {
      this.flags.set(key, value);
    });
    console.log(`[GameState] Loaded ${this.flags.size} flags`);
  }

  /**
   * Get flag count
   */
  getFlagCount(): number {
    return this.flags.size;
  }
}

