// Main Game Entry Point
import { Game } from './game.js';

console.log('main.js loaded!');

// Wait for DOM to be ready
window.addEventListener('DOMContentLoaded', () => {
  console.log('DOM ready, initializing game...');

  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');

  if (!canvas || !ctx) {
    console.error('Canvas not found!');
    return;
  }

  console.log('Canvas found:', canvas);

  // Initialize game
  let game;
  try {
    game = new Game(canvas, ctx);
    console.log('✓ Game instance created successfully!');
  } catch (err) {
    console.error('ERROR creating game:', err);
    alert('Game initialization failed! Check console for details.');
    return;
  }

  // Menu handling
  const startButton = document.getElementById('start-button');
  const controlsButton = document.getElementById('controls-button');
  const restartButton = document.getElementById('restart-button');
  const mainMenuButton = document.getElementById('main-menu-button');

  console.log('Buttons found:', {startButton, controlsButton, restartButton, mainMenuButton});

  if (startButton) {
    startButton.addEventListener('click', () => {
      console.log('✓ START GAME clicked!');
      try {
        document.getElementById('menu-overlay').classList.add('hidden');
        game.start();
        console.log('✓ Game started!');
      } catch (err) {
        console.error('ERROR starting game:', err);
        alert('Game start failed: ' + err.message);
      }
    });
  }

  if (controlsButton) {
    controlsButton.addEventListener('click', () => {
      document.getElementById('controls-info').style.display = 'block';
    });
  }

  if (restartButton) {
    restartButton.addEventListener('click', () => {
      document.getElementById('game-over-screen').classList.add('hidden');
      game.restart();
    });
  }

  if (mainMenuButton) {
    mainMenuButton.addEventListener('click', () => {
      document.getElementById('game-over-screen').classList.add('hidden');
      document.getElementById('menu-overlay').classList.remove('hidden');
      game.reset();
    });
  }

  // Handle window resize
  window.addEventListener('resize', () => {
    game.handleResize();
  });

  console.log('✓ All event listeners attached!');
});
