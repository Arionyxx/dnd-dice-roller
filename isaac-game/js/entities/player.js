// Player Entity
export class Player {
  constructor(x, y, game) {
    this.x = x;
    this.y = y;
    this.radius = 14;
    this.game = game;

    // Stats
    this.maxHealth = 6; // 3 hearts (2 per heart)
    this.health = this.maxHealth;
    this.speed = 200;
    this.damage = 1;
    this.tearDelay = 0.3; // seconds between tears
    this.tearSpeed = 400;
    this.range = 300;

    // State
    this.tears = [];
    this.tearCooldown = 0;
    this.invulnerable = false;
    this.invulnerableTime = 0;
    this.invulnerableDuration = 1.0; // seconds

    // Animation
    this.animationTime = 0;
    this.walkCycle = 0;
  }

  update(dt, input) {
    // Movement
    const move = input.getMovementVector();
    this.x += move.x * this.speed * dt;
    this.y += move.y * this.speed * dt;

    // Animation
    if (move.x !== 0 || move.y !== 0) {
      this.animationTime += dt * 8;
      this.walkCycle = Math.floor(this.animationTime) % 4;
    } else {
      this.walkCycle = 0;
    }

    // Shooting
    if (this.tearCooldown > 0) {
      this.tearCooldown -= dt;
    }

    if (input.isMouseDown() && this.tearCooldown <= 0) {
      this.shoot(input.getMousePosition());
      this.tearCooldown = this.tearDelay;
    }

    // Update tears
    for (const tear of this.tears) {
      tear.update(dt);
    }
    this.tears = this.tears.filter(t => t.alive);

    // Update invulnerability
    if (this.invulnerable) {
      this.invulnerableTime -= dt;
      if (this.invulnerableTime <= 0) {
        this.invulnerable = false;
      }
    }
  }

  shoot(mousePos) {
    const angle = Math.atan2(mousePos.y - this.y, mousePos.x - this.x);
    const tear = {
      x: this.x,
      y: this.y,
      vx: Math.cos(angle) * this.tearSpeed,
      vy: Math.sin(angle) * this.tearSpeed,
      radius: 6,
      damage: this.damage,
      alive: true,
      distanceTraveled: 0,
      maxDistance: this.range,
      update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.distanceTraveled += Math.hypot(this.vx * dt, this.vy * dt);
        if (this.distanceTraveled >= this.maxDistance) {
          this.alive = false;
        }
      }
    };
    this.tears.push(tear);
    this.game.audio.play('shoot');
  }

  takeDamage(amount, game) {
    if (this.invulnerable) return;

    this.health -= amount;
    if (this.health < 0) this.health = 0;

    this.invulnerable = true;
    this.invulnerableTime = this.invulnerableDuration;

    game.ui.update(this, game.gameStats);
    game.audio.play('playerHurt');
  }

  heal(amount) {
    this.health = Math.min(this.maxHealth, this.health + amount);
  }

  render(ctx) {
    // Render tears
    for (const tear of this.tears) {
      ctx.fillStyle = '#4a9eff';
      ctx.beginPath();
      ctx.arc(tear.x, tear.y, tear.radius, 0, Math.PI * 2);
      ctx.fill();

      // Shine effect
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.beginPath();
      ctx.arc(tear.x - 2, tear.y - 2, tear.radius / 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Render player
    ctx.save();

    // Flicker when invulnerable
    if (this.invulnerable && Math.floor(this.invulnerableTime * 10) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }

    // Body
    ctx.fillStyle = '#f5d7a1';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    const eyeOffset = 5;
    const eyeY = this.y - 3;
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(this.x - eyeOffset, eyeY, 3, 0, Math.PI * 2);
    ctx.arc(this.x + eyeOffset, eyeY, 3, 0, Math.PI * 2);
    ctx.fill();

    // Mouth (crying)
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(this.x, this.y + 5, 4, 0, Math.PI);
    ctx.stroke();

    // Tears on face
    ctx.fillStyle = '#4a9eff';
    ctx.beginPath();
    ctx.arc(this.x - eyeOffset, eyeY + 6, 2, 0, Math.PI * 2);
    ctx.arc(this.x + eyeOffset, eyeY + 6, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(this.x, this.y + this.radius + 2, this.radius * 0.8, this.radius * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}
