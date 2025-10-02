// Room Class - Manages individual dungeon rooms

import { Fly, Shooter, Charger } from './entities/enemy.js';
import { items } from './items.js';

export class Room {
  constructor(x, y, type = 'normal') {
    this.x = x; // Grid position
    this.y = y;
    this.type = type; // normal, boss, treasure, shop, start
    this.visited = false;
    this.cleared = false;

    // Room contents
    this.enemies = [];
    this.items = [];
    this.obstacles = [];

    // Room dimensions (in pixels)
    this.bounds = {
      left: 100,
      right: 860,
      top: 100,
      bottom: 540,
      centerX: 480,
      centerY: 320
    };

    // Doors (set by dungeon generator)
    this.doors = {
      north: false,
      south: false,
      east: false,
      west: false
    };
  }

  generate(game) {
    this.visited = true;
    this.enemies = [];
    this.items = [];
    this.obstacles = [];

    switch (this.type) {
      case 'start':
        // Starting room - no enemies
        break;

      case 'normal':
        this.generateNormalRoom(game);
        break;

      case 'treasure':
        this.generateTreasureRoom(game);
        break;

      case 'boss':
        this.generateBossRoom(game);
        break;

      case 'shop':
        this.generateShopRoom(game);
        break;

      default:
        this.generateNormalRoom(game);
    }
  }

  generateNormalRoom(game) {
    // Random number of enemies (3-7)
    const enemyCount = Math.floor(Math.random() * 5) + 3;

    // Enemy type weights
    const enemyTypes = [
      { type: Fly, weight: 50 },
      { type: Shooter, weight: 30 },
      { type: Charger, weight: 20 }
    ];

    for (let i = 0; i < enemyCount; i++) {
      // Random position, avoiding center
      let x, y;
      do {
        x = this.bounds.left + 50 + Math.random() * (this.bounds.right - this.bounds.left - 100);
        y = this.bounds.top + 50 + Math.random() * (this.bounds.bottom - this.bounds.top - 100);
      } while (Math.hypot(x - this.bounds.centerX, y - this.bounds.centerY) < 150);

      // Pick enemy type based on weights
      const totalWeight = enemyTypes.reduce((sum, e) => sum + e.weight, 0);
      let random = Math.random() * totalWeight;
      let EnemyClass = Fly;

      for (const enemyType of enemyTypes) {
        random -= enemyType.weight;
        if (random <= 0) {
          EnemyClass = enemyType.type;
          break;
        }
      }

      this.enemies.push(new EnemyClass(x, y, game));
    }

    // Random obstacles (rocks) - 2-4
    const obstacleCount = Math.floor(Math.random() * 3) + 2;
    for (let i = 0; i < obstacleCount; i++) {
      const x = this.bounds.left + 60 + Math.random() * (this.bounds.right - this.bounds.left - 120);
      const y = this.bounds.top + 60 + Math.random() * (this.bounds.bottom - this.bounds.top - 120);

      this.obstacles.push({
        x,
        y,
        radius: 20 + Math.random() * 15,
        type: 'rock'
      });
    }

    // Small chance for item pedestal (5%)
    if (Math.random() < 0.05) {
      this.spawnItemPedestal(game);
    }
  }

  generateTreasureRoom(game) {
    // Always has an item pedestal
    this.spawnItemPedestal(game);
  }

  spawnItemPedestal(game) {
    // Pick random item
    const availableItems = items.filter(item => {
      // Filter by rarity
      const roll = Math.random() * 100;
      if (item.rarity === 'common') return roll < 60;
      if (item.rarity === 'uncommon') return roll < 90;
      if (item.rarity === 'rare') return roll >= 90;
      return true;
    });

    if (availableItems.length === 0) return;

    const item = availableItems[Math.floor(Math.random() * availableItems.length)];

    const itemPedestal = {
      x: this.bounds.centerX,
      y: this.bounds.centerY,
      radius: 20,
      ...item,
      type: 'item'
    };

    this.items.push(itemPedestal);
  }

  generateBossRoom(game) {
    // Boss room - spawn multiple tough enemies
    // For now, spawn several chargers and shooters
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2;
      const dist = 150;
      const x = this.bounds.centerX + Math.cos(angle) * dist;
      const y = this.bounds.centerY + Math.sin(angle) * dist;

      if (i < 2) {
        this.enemies.push(new Charger(x, y, game));
      } else {
        this.enemies.push(new Shooter(x, y, game));
      }
    }

    // Add some flies
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const dist = 100;
      const x = this.bounds.centerX + Math.cos(angle) * dist;
      const y = this.bounds.centerY + Math.sin(angle) * dist;
      this.enemies.push(new Fly(x, y, game));
    }
  }

  generateShopRoom(game) {
    // Shop room - items for purchase (future implementation)
    // For now, just spawn a few items
    const shopItems = [
      { x: this.bounds.centerX - 100, y: this.bounds.centerY },
      { x: this.bounds.centerX, y: this.bounds.centerY },
      { x: this.bounds.centerX + 100, y: this.bounds.centerY }
    ];

    for (const pos of shopItems) {
      const item = items[Math.floor(Math.random() * items.length)];
      this.items.push({
        ...pos,
        radius: 20,
        ...item,
        type: 'item'
      });
    }
  }

  update(dt) {
    // Update all enemies
    for (const enemy of this.enemies) {
      enemy.update(dt);
    }

    // Remove dead enemies
    this.enemies = this.enemies.filter(e => e.alive);

    // Mark room as cleared when all enemies are defeated
    if (this.enemies.length === 0 && !this.cleared && this.type === 'normal') {
      this.cleared = true;
    }
  }

  render(ctx) {
    // Draw floor
    this.renderFloor(ctx);

    // Draw walls
    this.renderWalls(ctx);

    // Draw obstacles
    for (const obstacle of this.obstacles) {
      this.renderObstacle(ctx, obstacle);
    }

    // Draw items
    for (const item of this.items) {
      this.renderItem(ctx, item);
    }

    // Draw enemies
    for (const enemy of this.enemies) {
      enemy.render(ctx);
    }

    // Draw doors
    this.renderDoors(ctx);
  }

  renderFloor(ctx) {
    // Main floor area
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(
      this.bounds.left,
      this.bounds.top,
      this.bounds.right - this.bounds.left,
      this.bounds.bottom - this.bounds.top
    );

    // Floor tile pattern
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 1;

    const tileSize = 40;
    for (let x = this.bounds.left; x < this.bounds.right; x += tileSize) {
      for (let y = this.bounds.top; y < this.bounds.bottom; y += tileSize) {
        ctx.strokeRect(x, y, tileSize, tileSize);
      }
    }

    // Decorative center
    if (this.type === 'treasure' || this.type === 'boss') {
      ctx.fillStyle = '#3a2a2a';
      ctx.beginPath();
      ctx.arc(this.bounds.centerX, this.bounds.centerY, 80, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  renderWalls(ctx) {
    const wallThickness = 40;

    // Wall color based on room type
    let wallColor = '#5a3a1a';
    if (this.type === 'boss') wallColor = '#6a1a1a';
    if (this.type === 'treasure') wallColor = '#5a5a1a';

    ctx.fillStyle = wallColor;

    // Top wall
    ctx.fillRect(0, 0, 960, this.bounds.top);

    // Bottom wall
    ctx.fillRect(0, this.bounds.bottom, 960, 640 - this.bounds.bottom);

    // Left wall
    ctx.fillRect(0, 0, this.bounds.left, 640);

    // Right wall
    ctx.fillRect(this.bounds.right, 0, 960 - this.bounds.right, 640);

    // Wall borders
    ctx.strokeStyle = '#3a2a1a';
    ctx.lineWidth = 3;
    ctx.strokeRect(
      this.bounds.left,
      this.bounds.top,
      this.bounds.right - this.bounds.left,
      this.bounds.bottom - this.bounds.top
    );
  }

  renderDoors(ctx) {
    const doorWidth = 60;
    const doorHeight = 40;
    const doorDepth = 20;

    // Check if enemies remain (doors closed)
    const doorsOpen = this.enemies.length === 0;

    const doorColor = doorsOpen ? '#4a4a4a' : '#8b0000';

    // North door
    if (this.doors.north) {
      ctx.fillStyle = doorColor;
      ctx.fillRect(
        this.bounds.centerX - doorWidth / 2,
        this.bounds.top - doorDepth,
        doorWidth,
        doorDepth + 5
      );
      ctx.strokeStyle = '#2a2a2a';
      ctx.lineWidth = 2;
      ctx.strokeRect(
        this.bounds.centerX - doorWidth / 2,
        this.bounds.top - doorDepth,
        doorWidth,
        doorDepth + 5
      );
    }

    // South door
    if (this.doors.south) {
      ctx.fillStyle = doorColor;
      ctx.fillRect(
        this.bounds.centerX - doorWidth / 2,
        this.bounds.bottom - 5,
        doorWidth,
        doorDepth + 5
      );
      ctx.strokeStyle = '#2a2a2a';
      ctx.lineWidth = 2;
      ctx.strokeRect(
        this.bounds.centerX - doorWidth / 2,
        this.bounds.bottom - 5,
        doorWidth,
        doorDepth + 5
      );
    }

    // East door
    if (this.doors.east) {
      ctx.fillStyle = doorColor;
      ctx.fillRect(
        this.bounds.right - 5,
        this.bounds.centerY - doorWidth / 2,
        doorDepth + 5,
        doorWidth
      );
      ctx.strokeStyle = '#2a2a2a';
      ctx.lineWidth = 2;
      ctx.strokeRect(
        this.bounds.right - 5,
        this.bounds.centerY - doorWidth / 2,
        doorDepth + 5,
        doorWidth
      );
    }

    // West door
    if (this.doors.west) {
      ctx.fillStyle = doorColor;
      ctx.fillRect(
        this.bounds.left - doorDepth,
        this.bounds.centerY - doorWidth / 2,
        doorDepth + 5,
        doorWidth
      );
      ctx.strokeStyle = '#2a2a2a';
      ctx.lineWidth = 2;
      ctx.strokeRect(
        this.bounds.left - doorDepth,
        this.bounds.centerY - doorWidth / 2,
        doorDepth + 5,
        doorWidth
      );
    }
  }

  renderObstacle(ctx, obstacle) {
    // Rock obstacle
    ctx.fillStyle = '#6a6a6a';
    ctx.beginPath();
    ctx.arc(obstacle.x, obstacle.y, obstacle.radius, 0, Math.PI * 2);
    ctx.fill();

    // Rock detail
    ctx.fillStyle = '#5a5a5a';
    ctx.beginPath();
    ctx.arc(obstacle.x - 5, obstacle.y - 5, obstacle.radius * 0.6, 0, Math.PI * 2);
    ctx.fill();

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(
      obstacle.x,
      obstacle.y + obstacle.radius,
      obstacle.radius * 0.8,
      obstacle.radius * 0.3,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  renderItem(ctx, item) {
    const pulseTime = Date.now() / 1000;
    const pulse = Math.sin(pulseTime * 2) * 0.2 + 0.8;

    // Pedestal
    ctx.fillStyle = '#5a5a5a';
    ctx.fillRect(item.x - 25, item.y + 10, 50, 15);
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(item.x - 22, item.y + 25, 44, 8);

    // Item glow
    const gradient = ctx.createRadialGradient(item.x, item.y - 10, 5, item.x, item.y - 10, 30);

    // Glow color based on rarity
    let glowColor = 'rgba(218, 165, 32, 0.4)'; // Common (gold)
    if (item.rarity === 'uncommon') glowColor = 'rgba(64, 224, 208, 0.4)'; // Turquoise
    if (item.rarity === 'rare') glowColor = 'rgba(218, 112, 214, 0.6)'; // Pink
    if (item.rarity === 'special') glowColor = 'rgba(255, 69, 0, 0.6)'; // Red-orange

    gradient.addColorStop(0, glowColor);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(item.x, item.y - 10, 30 * pulse, 0, Math.PI * 2);
    ctx.fill();

    // Item icon (simple colored circle for now)
    ctx.fillStyle = item.rarity === 'rare' ? '#da70d6' :
                    item.rarity === 'uncommon' ? '#40e0d0' :
                    item.rarity === 'special' ? '#ff4500' : '#daa520';
    ctx.beginPath();
    ctx.arc(item.x, item.y - 10, 15 * pulse, 0, Math.PI * 2);
    ctx.fill();

    // Icon highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.arc(item.x - 5, item.y - 15, 5, 0, Math.PI * 2);
    ctx.fill();

    // Item name (if close to player)
    // This could be enhanced with distance checking
  }
}
