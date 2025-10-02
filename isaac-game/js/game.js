// Core Game Manager
import { InputManager } from './input.js';
import { Player } from './entities/player.js';
import { Room } from './room.js';
import { DungeonGenerator } from './dungeon.js';
import { ParticleSystem } from './particles.js';
import { AudioManager } from './audio.js';
import { CollisionSystem } from './collision.js';
import { UI } from './ui.js';

export class Game {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.running = false;
    this.paused = false;

    this.input = new InputManager(canvas);
    this.audio = new AudioManager();
    this.particles = new ParticleSystem();
    this.collision = new CollisionSystem();
    this.ui = new UI();

    this.player = null;
    this.dungeon = null;
    this.currentRoom = null;

    this.gameStats = {
      floor: 1,
      roomsCleared: 0,
      enemiesKilled: 0,
      keys: 0,
      bombs: 1
    };

    this.lastTime = 0;
    this.accumulator = 0;
    this.fixedTimeStep = 1000 / 60; // 60 FPS

    this.camera = {
      x: 0,
      y: 0,
      shake: 0,
      shakeDecay: 0.9
    };
  }

  start() {
    this.running = true;
    this.init();
    this.lastTime = performance.now();
    requestAnimationFrame((time) => this.gameLoop(time));
  }

  init() {
    // Create dungeon
    this.dungeon = new DungeonGenerator(5, 5);
    this.dungeon.generate();

    // Create player
    this.player = new Player(480, 320, this);

    // Load first room
    this.currentRoom = this.dungeon.getCurrentRoom();
    this.currentRoom.generate(this);

    // Update UI
    this.ui.update(this.player, this.gameStats);
    this.ui.updateMinimap(this.dungeon);
  }

  gameLoop(currentTime) {
    if (!this.running) return;

    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    this.accumulator += deltaTime;

    // Fixed timestep update
    while (this.accumulator >= this.fixedTimeStep) {
      if (!this.paused) {
        this.update(this.fixedTimeStep / 1000);
      }
      this.accumulator -= this.fixedTimeStep;
    }

    this.render();
    requestAnimationFrame((time) => this.gameLoop(time));
  }

  update(dt) {
    // Update player
    this.player.update(dt, this.input);

    // Update room
    if (this.currentRoom) {
      this.currentRoom.update(dt);

      // Check room transitions
      this.checkRoomTransition();

      // Check collisions
      this.handleCollisions();
    }

    // Update particles
    this.particles.update(dt);

    // Update camera shake
    if (this.camera.shake > 0) {
      this.camera.shake *= this.camera.shakeDecay;
      if (this.camera.shake < 0.1) this.camera.shake = 0;
    }

    // Check for pause
    if (this.input.isKeyPressed('Escape')) {
      this.paused = !this.paused;
    }

    // Check for game over
    if (this.player.health <= 0) {
      this.gameOver();
    }
  }

  handleCollisions() {
    // Player vs enemies
    for (const enemy of this.currentRoom.enemies) {
      if (this.collision.circleCircle(this.player, enemy)) {
        this.player.takeDamage(1, this);
        this.cameraShake(5);
      }
    }

    // Player tears vs enemies
    for (const tear of this.player.tears) {
      for (const enemy of this.currentRoom.enemies) {
        if (this.collision.circleCircle(tear, enemy)) {
          enemy.takeDamage(this.player.damage, this);
          tear.alive = false;
          this.particles.createImpact(tear.x, tear.y, '#4a9eff');

          if (enemy.health <= 0) {
            this.gameStats.enemiesKilled++;
            this.particles.createExplosion(enemy.x, enemy.y, '#8b0000');
            this.audio.play('enemyDeath');
          }
        }
      }
    }

    // Player tears vs walls (simple bounds check)
    for (const tear of this.player.tears) {
      if (tear.x < 100 || tear.x > 860 || tear.y < 100 || tear.y > 540) {
        tear.alive = false;
      }
    }

    // Player vs items
    for (const item of this.currentRoom.items) {
      if (this.collision.circleCircle(this.player, item)) {
        this.pickupItem(item);
      }
    }

    // Keep player in bounds
    this.player.x = Math.max(120, Math.min(840, this.player.x));
    this.player.y = Math.max(120, Math.min(520, this.player.y));
  }

  checkRoomTransition() {
    // Check if player is near a door and all enemies are cleared
    if (this.currentRoom.enemies.length > 0) return;

    const doors = [
      { x: 480, y: 80, dir: 'north' },
      { x: 480, y: 560, dir: 'south' },
      { x: 880, y: 320, dir: 'east' },
      { x: 80, y: 320, dir: 'west' }
    ];

    for (const door of doors) {
      const dist = Math.hypot(this.player.x - door.x, this.player.y - door.y);
      if (dist < 40) {
        this.transitionRoom(door.dir);
        break;
      }
    }
  }

  transitionRoom(direction) {
    if (!this.dungeon.canMove(direction)) return;

    if (!this.currentRoom.cleared) {
      this.gameStats.roomsCleared++;
      this.currentRoom.cleared = true;
    }

    this.dungeon.move(direction);
    this.currentRoom = this.dungeon.getCurrentRoom();

    if (!this.currentRoom.visited) {
      this.currentRoom.generate(this);
    }

    // Position player at opposite door
    switch (direction) {
      case 'north':
        this.player.x = 480;
        this.player.y = 500;
        break;
      case 'south':
        this.player.x = 480;
        this.player.y = 120;
        break;
      case 'east':
        this.player.x = 120;
        this.player.y = 320;
        break;
      case 'west':
        this.player.x = 840;
        this.player.y = 320;
        break;
    }

    this.ui.updateMinimap(this.dungeon);
  }

  pickupItem(item) {
    item.pickup(this.player, this);
    this.currentRoom.items = this.currentRoom.items.filter(i => i !== item);
    this.ui.showItemPickup(item.name, item.description);
    this.audio.play('itemPickup');
    this.ui.update(this.player, this.gameStats);
  }

  cameraShake(intensity) {
    this.camera.shake = intensity;
  }

  render() {
    this.ctx.save();

    // Clear
    this.ctx.fillStyle = '#1a1a1a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Apply camera shake
    if (this.camera.shake > 0) {
      const shakeX = (Math.random() - 0.5) * this.camera.shake;
      const shakeY = (Math.random() - 0.5) * this.camera.shake;
      this.ctx.translate(shakeX, shakeY);
    }

    // Render room
    if (this.currentRoom) {
      this.currentRoom.render(this.ctx);
    }

    // Render player
    this.player.render(this.ctx);

    // Render particles
    this.particles.render(this.ctx);

    // Render pause overlay
    if (this.paused) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = '#fff';
      this.ctx.font = '48px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
    }

    this.ctx.restore();
  }

  gameOver() {
    this.running = false;
    document.getElementById('final-floor').textContent = this.gameStats.floor;
    document.getElementById('final-rooms').textContent = this.gameStats.roomsCleared;
    document.getElementById('final-enemies').textContent = this.gameStats.enemiesKilled;
    document.getElementById('game-over-screen').classList.remove('hidden');
    this.audio.play('gameOver');
  }

  restart() {
    this.reset();
    this.start();
  }

  reset() {
    this.running = false;
    this.paused = false;
    this.gameStats = {
      floor: 1,
      roomsCleared: 0,
      enemiesKilled: 0,
      keys: 0,
      bombs: 1
    };
  }

  handleResize() {
    // Optional: handle canvas resize
  }
}
