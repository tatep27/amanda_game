import Phaser from 'phaser';
import { gameConfig } from './game/config';

// Create the Phaser game instance
const game = new Phaser.Game(gameConfig);

// Global reference for debugging (optional)
(window as any).game = game;

export default game;

