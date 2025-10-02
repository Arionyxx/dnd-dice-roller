// Enemy Base Class and Specific Enemy Types

// Base Enemy Class
export class Enemy {
  constructor(x, y, type, game) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.game = game;
    this.radius = 12;

    // Stats (set by subclass)
    this.health = 1;
    this.maxHealth = 1;
    this.speed = 100;
    this.damage = 1;
    this.contactDamage = 1;

    // State
    this.alive = true;
    this.stunned = false;
    this.stunnedTime = 0;

    // Visual
    this.color = '#8b0000';
    this.animationTime = 0;
  }

  update(dt) {
    if (this.stunned) {
      this.stunnedTime -= dt;
      if (this.stunnedTime <= 0) {
        this.stunned = false;
      }
      return;
    }

    this.animationTime += dt;
    this.updateBehavior(dt);
  }

  updateBehavior(dt) {
    // Override in subclass
  }

  takeDamage(amount, game) {
    this.health -= amount;
    if (this.health <= 0) {
      this.alive = false;

      // Chance to drop pickup
      if (Math.random() < 0.15) {
        this.dropPickup();
      }
    } else {
      // Brief stun on hit
      this.stunned = true;
      this.stunnedTime = 0.1;
    }
  }

  dropPickup() {
    // 70% heart, 30% coin (for future implementation)
    if (Math.random() < 0.7) {
      const pickup = {
        x: this.x,
        y: this.y,
        radius: 8,
        type: 'heart',
        name: 'Half Heart',
        description: '+0.5 Health',
        pickup: (player, game) => {
          player.heal(1);
          game.ui.update(player, game.gameStats);
        }
      };
      this.game.currentRoom.items.push(pickup);
    }
  }

  render(ctx) {
    ctx.save();

    // Flash white when damaged
    if (this.stunned) {
      ctx.fillStyle = '#fff';
    } else {
      ctx.fillStyle = this.color;
    }

    // Draw enemy body (override for custom rendering)
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(this.x, this.y + this.radius + 2, this.radius * 0.8, this.radius * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  moveTowardsPlayer(dt) {
    const player = this.game.player;
    const angle = Math.atan2(player.y - this.y, player.x - this.x);
    this.x += Math.cos(angle) * this.speed * dt;
    this.y += Math.sin(angle) * this.speed * dt;
  }

  keepInBounds() {
    this.x = Math.max(120, Math.min(840, this.x));
    this.y = Math.max(120, Math.min(520, this.y));
  }
}

// Fly Enemy - Basic enemy that slowly flies toward player
export class Fly extends Enemy {
  constructor(x, y, game) {
    super(x, y, 'fly', game);

    this.health = 2;
    this.maxHealth = 2;
    this.speed = 80;
    this.radius = 10;
    this.color = '#4a4a4a';

    // Fly-specific
    this.bobOffset = Math.random() * Math.PI * 2;
    this.bobSpeed = 3;
  }

  updateBehavior(dt) {
    // Move toward player
    this.moveTowardsPlayer(dt);

    // Add slight bobbing motion
    const bobAmount = Math.sin(this.animationTime * this.bobSpeed + this.bobOffset) * 2;
    this.y += bobAmount * dt * 10;

    this.keepInBounds();
  }

  render(ctx) {
    ctx.save();

    // Flash when damaged
    if (this.stunned) {
      ctx.fillStyle = '#fff';
    } else {
      ctx.fillStyle = this.color;
    }

    // Body
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Wings (flapping animation)
    const wingFlap = Math.sin(this.animationTime * 10) * 0.5 + 0.5;
    ctx.fillStyle = 'rgba(100, 100, 100, 0.5)';

    // Left wing
    ctx.beginPath();
    ctx.ellipse(this.x - this.radius, this.y, this.radius * 0.6, this.radius * (0.4 + wingFlap * 0.6), Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();

    // Right wing
    ctx.beginPath();
    ctx.ellipse(this.x + this.radius, this.y, this.radius * 0.6, this.radius * (0.4 + wingFlap * 0.6), -Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#d42a2a';
    ctx.beginPath();
    ctx.arc(this.x - 3, this.y - 2, 2, 0, Math.PI * 2);
    ctx.arc(this.x + 3, this.y - 2, 2, 0, Math.PI * 2);
    ctx.fill();

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(this.x, this.y + this.radius + 4, this.radius * 0.8, this.radius * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

// Shooter Enemy - Stays at distance and shoots at player
export class Shooter extends Enemy {
  constructor(x, y, game) {
    super(x, y, 'shooter', game);

    this.health = 3;
    this.maxHealth = 3;
    this.speed = 60;
    this.radius = 14;
    this.color = '#a04040';

    // Shooter-specific
    this.shootCooldown = 0;
    this.shootDelay = 2.0; // Shoot every 2 seconds
    this.shots = [];
    this.preferredDistance = 200; // Stay this far from player
  }

  updateBehavior(dt) {
    const player = this.game.player;
    const distToPlayer = Math.hypot(player.x - this.x, player.y - this.y);
    const angle = Math.atan2(player.y - this.y, player.x - this.x);

    // Maintain distance from player
    if (distToPlayer < this.preferredDistance - 30) {
      // Too close, back away
      this.x -= Math.cos(angle) * this.speed * dt;
      this.y -= Math.sin(angle) * this.speed * dt;
    } else if (distToPlayer > this.preferredDistance + 30) {
      // Too far, move closer
      this.x += Math.cos(angle) * this.speed * dt * 0.5;
      this.y += Math.sin(angle) * this.speed * dt * 0.5;
    }

    this.keepInBounds();

    // Shooting
    this.shootCooldown -= dt;
    if (this.shootCooldown <= 0) {
      this.shoot();
      this.shootCooldown = this.shootDelay;
    }

    // Update shots
    for (const shot of this.shots) {
      shot.x += shot.vx * dt;
      shot.y += shot.vy * dt;
      shot.lifetime -= dt;
      if (shot.lifetime <= 0) shot.alive = false;
    }
    this.shots = this.shots.filter(s => s.alive);
  }

  shoot() {
    const player = this.game.player;
    const angle = Math.atan2(player.y - this.y, player.x - this.x);
    const speed = 200;

    this.shots.push({
      x: this.x,
      y: this.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: 5,
      alive: true,
      lifetime: 3.0
    });
  }

  render(ctx) {
    // Render shots
    ctx.fillStyle = '#ff4444';
    for (const shot of this.shots) {
      ctx.beginPath();
      ctx.arc(shot.x, shot.y, shot.radius, 0, Math.PI * 2);
      ctx.fill();

      // Glow effect
      ctx.fillStyle = 'rgba(255, 100, 100, 0.3)';
      ctx.beginPath();
      ctx.arc(shot.x, shot.y, shot.radius * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ff4444';
    }

    ctx.save();

    // Flash when damaged
    if (this.stunned) {
      ctx.fillStyle = '#fff';
    } else {
      ctx.fillStyle = this.color;
    }

    // Body
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Gun barrel (points toward player)
    const player = this.game.player;
    const angle = Math.atan2(player.y - this.y, player.x - this.x);
    ctx.fillStyle = '#2a2a2a';
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(angle);
    ctx.fillRect(this.radius - 3, -3, 10, 6);
    ctx.restore();

    // Eyes
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(this.x - 4, this.y - 3, 3, 0, Math.PI * 2);
    ctx.arc(this.x + 4, this.y - 3, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(this.x - 4, this.y - 3, 1.5, 0, Math.PI * 2);
    ctx.arc(this.x + 4, this.y - 3, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(this.x, this.y + this.radius + 2, this.radius * 0.8, this.radius * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Override to check shot collisions
  update(dt) {
    super.update(dt);

    // Check shot collisions with player
    const player = this.game.player;
    for (const shot of this.shots) {
      const dist = Math.hypot(player.x - shot.x, player.y - shot.y);
      if (dist < player.radius + shot.radius) {
        shot.alive = false;
        player.takeDamage(1, this.game);
        this.game.particles.createImpact(shot.x, shot.y, '#ff4444');
      }
    }
  }
}

// Charger Enemy - Charges toward player in straight lines
export class Charger extends Enemy {
  constructor(x, y, game) {
    super(x, y, 'charger', game);

    this.health = 4;
    this.maxHealth = 4;
    this.speed = 50;
    this.chargeSpeed = 350;
    this.radius = 16;
    this.color = '#6b4423';

    // Charger-specific
    this.state = 'idle'; // idle, preparing, charging
    this.prepareTime = 0;
    this.prepareDuration = 0.8;
    this.chargeDirection = { x: 0, y: 0 };
    this.chargeCooldown = 0;
    this.chargeCooldownDuration = 2.0;
  }

  updateBehavior(dt) {
    const player = this.game.player;
    const distToPlayer = Math.hypot(player.x - this.x, player.y - this.y);

    switch (this.state) {
      case 'idle':
        // Slowly move toward player
        if (distToPlayer > 50) {
          this.moveTowardsPlayer(dt);
        }

        // Check if should prepare charge
        this.chargeCooldown -= dt;
        if (this.chargeCooldown <= 0 && distToPlayer < 300 && distToPlayer > 100) {
          this.state = 'preparing';
          this.prepareTime = this.prepareDuration;

          // Calculate charge direction
          const angle = Math.atan2(player.y - this.y, player.x - this.x);
          this.chargeDirection.x = Math.cos(angle);
          this.chargeDirection.y = Math.sin(angle);
        }
        break;

      case 'preparing':
        this.prepareTime -= dt;
        if (this.prepareTime <= 0) {
          this.state = 'charging';
        }
        break;

      case 'charging':
        // Charge in locked direction
        this.x += this.chargeDirection.x * this.chargeSpeed * dt;
        this.y += this.chargeDirection.y * this.chargeSpeed * dt;

        // Check if hit wall
        if (this.x <= 120 || this.x >= 840 || this.y <= 120 || this.y >= 520) {
          this.state = 'idle';
          this.chargeCooldown = this.chargeCooldownDuration;
          this.game.particles.createImpact(this.x, this.y, '#aaa');
          this.keepInBounds();
        }
        break;
    }
  }

  render(ctx) {
    ctx.save();

    // Charging effect
    if (this.state === 'preparing') {
      // Pulsing red glow
      const glowIntensity = (Math.sin(this.animationTime * 10) + 1) / 2;
      ctx.fillStyle = `rgba(255, 0, 0, ${glowIntensity * 0.5})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Flash when damaged
    if (this.stunned) {
      ctx.fillStyle = '#fff';
    } else if (this.state === 'charging') {
      ctx.fillStyle = '#8b5a3c'; // Lighter when charging
    } else {
      ctx.fillStyle = this.color;
    }

    // Body
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Horns
    ctx.fillStyle = '#3a2a1a';
    ctx.beginPath();
    ctx.moveTo(this.x - this.radius * 0.5, this.y - this.radius);
    ctx.lineTo(this.x - this.radius * 0.7, this.y - this.radius * 1.3);
    ctx.lineTo(this.x - this.radius * 0.3, this.y - this.radius * 0.8);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(this.x + this.radius * 0.5, this.y - this.radius);
    ctx.lineTo(this.x + this.radius * 0.7, this.y - this.radius * 1.3);
    ctx.lineTo(this.x + this.radius * 0.3, this.y - this.radius * 0.8);
    ctx.fill();

    // Eyes (angry)
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(this.x - 5, this.y - 3, 3, 0, Math.PI * 2);
    ctx.arc(this.x + 5, this.y - 3, 3, 0, Math.PI * 2);
    ctx.fill();

    // Snout
    ctx.fillStyle = '#5a3a2a';
    ctx.beginPath();
    ctx.arc(this.x, this.y + 5, 6, 0, Math.PI);
    ctx.fill();

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(this.x, this.y + this.radius + 2, this.radius * 0.8, this.radius * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
