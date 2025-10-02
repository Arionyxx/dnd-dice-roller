// UI Manager - Handles all UI updates and display

export class UI {
  constructor() {
    // Cache DOM elements
    this.heartsContainer = document.getElementById('hearts-container');
    this.floorNum = document.getElementById('floor-num');
    this.roomsCleared = document.getElementById('rooms-cleared');
    this.keyCount = document.getElementById('key-count');
    this.bombCount = document.getElementById('bomb-count');
    this.minimap = document.getElementById('minimap');
    this.itemNotification = document.getElementById('item-pickup-notification');

    // Notification timeout
    this.notificationTimeout = null;
  }

  // Update all UI elements
  update(player, stats) {
    this.updateHearts(player);
    this.updateStats(stats);
  }

  // Update heart display
  updateHearts(player) {
    this.heartsContainer.innerHTML = '';

    const fullHearts = Math.floor(player.health / 2);
    const hasHalfHeart = player.health % 2 === 1;
    const totalHeartContainers = Math.ceil(player.maxHealth / 2);

    // Render hearts
    for (let i = 0; i < totalHeartContainers; i++) {
      const heart = document.createElement('div');
      heart.className = 'heart';

      if (i < fullHearts) {
        // Full heart
        heart.classList.add('full');
      } else if (i === fullHearts && hasHalfHeart) {
        // Half heart
        heart.classList.add('half');
      } else {
        // Empty heart
        heart.classList.add('empty');
      }

      this.heartsContainer.appendChild(heart);
    }
  }

  // Update stats panel
  updateStats(stats) {
    this.floorNum.textContent = stats.floor;
    this.roomsCleared.textContent = stats.roomsCleared;
    this.keyCount.textContent = stats.keys;
    this.bombCount.textContent = stats.bombs;
  }

  // Update minimap
  updateMinimap(dungeon) {
    const data = dungeon.getGridForMinimap();
    this.minimap.innerHTML = '';

    // Create minimap grid
    for (let y = 0; y < data.height; y++) {
      const row = document.createElement('div');
      row.style.display = 'flex';

      for (let x = 0; x < data.width; x++) {
        const cell = document.createElement('div');
        cell.className = 'room-cell';

        const room = data.grid[y][x];

        if (room) {
          if (x === data.currentX && y === data.currentY) {
            // Current room
            cell.classList.add('current');
          } else if (room.visited) {
            // Visited room
            cell.classList.add('visited');
          }

          // Add special room indicators
          if (room.type === 'boss') {
            cell.style.background = '#8b0000';
          } else if (room.type === 'treasure') {
            cell.style.background = '#daa520';
          } else if (room.type === 'shop') {
            cell.style.background = '#4169e1';
          }
        } else {
          // No room
          cell.style.visibility = 'hidden';
        }

        row.appendChild(cell);
      }

      this.minimap.appendChild(row);
    }
  }

  // Show item pickup notification
  showItemPickup(name, description) {
    // Clear existing timeout
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
    }

    // Set notification content
    this.itemNotification.innerHTML = `
      <div style="font-size: 18px; margin-bottom: 5px;">${name}</div>
      <div style="font-size: 12px; font-weight: normal; opacity: 0.9;">${description}</div>
    `;

    // Show notification
    this.itemNotification.classList.add('show');

    // Hide after 3 seconds
    this.notificationTimeout = setTimeout(() => {
      this.itemNotification.classList.remove('show');
    }, 3000);
  }

  // Show temporary message
  showMessage(message, duration = 2000) {
    const messageEl = document.createElement('div');
    messageEl.style.position = 'absolute';
    messageEl.style.top = '50%';
    messageEl.style.left = '50%';
    messageEl.style.transform = 'translate(-50%, -50%)';
    messageEl.style.background = 'rgba(0, 0, 0, 0.8)';
    messageEl.style.color = '#fff';
    messageEl.style.padding = '20px 40px';
    messageEl.style.borderRadius = '8px';
    messageEl.style.fontSize = '24px';
    messageEl.style.fontWeight = 'bold';
    messageEl.style.zIndex = '1000';
    messageEl.style.pointerEvents = 'none';
    messageEl.textContent = message;

    document.getElementById('game-container').appendChild(messageEl);

    setTimeout(() => {
      messageEl.remove();
    }, duration);
  }

  // Show room clear message
  showRoomClear() {
    this.showMessage('ROOM CLEAR!', 1500);
  }

  // Show floor transition
  showFloorTransition(floorNum) {
    this.showMessage(`FLOOR ${floorNum}`, 2000);
  }

  // Update boss health bar (for future boss implementation)
  showBossHealth(name, health, maxHealth) {
    let bossBar = document.getElementById('boss-health-bar');

    if (!bossBar) {
      bossBar = document.createElement('div');
      bossBar.id = 'boss-health-bar';
      bossBar.style.position = 'absolute';
      bossBar.style.top = '10px';
      bossBar.style.left = '50%';
      bossBar.style.transform = 'translateX(-50%)';
      bossBar.style.width = '400px';
      bossBar.style.background = 'rgba(0, 0, 0, 0.8)';
      bossBar.style.padding = '10px';
      bossBar.style.borderRadius = '4px';
      bossBar.style.border = '2px solid #8b0000';

      document.getElementById('ui-overlay').appendChild(bossBar);
    }

    const percentage = (health / maxHealth) * 100;

    bossBar.innerHTML = `
      <div style="font-size: 14px; margin-bottom: 5px; text-align: center;">${name}</div>
      <div style="background: #3a1a1a; height: 20px; border-radius: 2px; overflow: hidden;">
        <div style="background: linear-gradient(to right, #8b0000, #ff0000); height: 100%; width: ${percentage}%; transition: width 0.3s;"></div>
      </div>
    `;
  }

  hideBossHealth() {
    const bossBar = document.getElementById('boss-health-bar');
    if (bossBar) {
      bossBar.remove();
    }
  }

  // Show damage number
  showDamageNumber(x, y, damage) {
    const canvas = document.getElementById('game-canvas');
    const rect = canvas.getBoundingClientRect();

    const damageEl = document.createElement('div');
    damageEl.style.position = 'absolute';
    damageEl.style.left = `${rect.left + x}px`;
    damageEl.style.top = `${rect.top + y}px`;
    damageEl.style.color = '#ff4444';
    damageEl.style.fontSize = '20px';
    damageEl.style.fontWeight = 'bold';
    damageEl.style.pointerEvents = 'none';
    damageEl.style.zIndex = '1000';
    damageEl.style.textShadow = '2px 2px 2px #000';
    damageEl.textContent = `-${damage}`;

    document.body.appendChild(damageEl);

    // Animate upward and fade out
    let offsetY = 0;
    let opacity = 1;
    const interval = setInterval(() => {
      offsetY -= 2;
      opacity -= 0.05;

      damageEl.style.transform = `translateY(${offsetY}px)`;
      damageEl.style.opacity = opacity;

      if (opacity <= 0) {
        clearInterval(interval);
        damageEl.remove();
      }
    }, 30);
  }

  // Show pause menu
  showPauseMenu() {
    let pauseMenu = document.getElementById('pause-menu');

    if (!pauseMenu) {
      pauseMenu = document.createElement('div');
      pauseMenu.id = 'pause-menu';
      pauseMenu.style.position = 'absolute';
      pauseMenu.style.inset = '0';
      pauseMenu.style.background = 'rgba(0, 0, 0, 0.8)';
      pauseMenu.style.display = 'flex';
      pauseMenu.style.flexDirection = 'column';
      pauseMenu.style.justifyContent = 'center';
      pauseMenu.style.alignItems = 'center';
      pauseMenu.style.zIndex = '1000';

      pauseMenu.innerHTML = `
        <h1 style="font-size: 48px; margin-bottom: 30px;">PAUSED</h1>
        <button class="menu-button" onclick="this.parentElement.remove()">RESUME</button>
      `;

      document.getElementById('game-container').appendChild(pauseMenu);
    }
  }

  // Clear all temporary UI elements
  clearTemporary() {
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
    }
    this.itemNotification.classList.remove('show');
    this.hideBossHealth();
  }
}
