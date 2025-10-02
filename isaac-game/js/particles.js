// Particle System for visual effects

export class ParticleSystem {
  constructor() {
    this.particles = [];
    this.maxParticles = 500; // Prevent memory issues
  }

  update(dt) {
    // Update all particles
    for (const particle of this.particles) {
      // Apply velocity
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;

      // Apply gravity (if enabled)
      if (particle.gravity) {
        particle.vy += particle.gravity * dt;
      }

      // Apply drag/friction
      particle.vx *= 0.98;
      particle.vy *= 0.98;

      // Fade out
      particle.life -= dt;
      particle.alpha = Math.max(0, particle.life / particle.maxLife);

      // Shrink over time (if enabled)
      if (particle.shrink) {
        particle.size = Math.max(0.5, particle.size * 0.97);
      }
    }

    // Remove dead particles
    this.particles = this.particles.filter(p => p.life > 0);
  }

  render(ctx) {
    ctx.save();

    for (const particle of this.particles) {
      ctx.globalAlpha = particle.alpha;

      if (particle.shape === 'circle') {
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (particle.shape === 'square') {
        ctx.fillStyle = particle.color;
        ctx.fillRect(
          particle.x - particle.size / 2,
          particle.y - particle.size / 2,
          particle.size,
          particle.size
        );
      } else if (particle.shape === 'line') {
        ctx.strokeStyle = particle.color;
        ctx.lineWidth = particle.size;
        ctx.beginPath();
        ctx.moveTo(particle.x, particle.y);
        ctx.lineTo(particle.x - particle.vx * 0.1, particle.y - particle.vy * 0.1);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  createExplosion(x, y, color = '#ff4500', count = 20) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = 100 + Math.random() * 150;

      this.addParticle({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 4,
        color: this.varyColor(color),
        life: 0.5 + Math.random() * 0.5,
        maxLife: 0.5 + Math.random() * 0.5,
        alpha: 1,
        shape: 'circle',
        gravity: 200,
        shrink: true
      });
    }

    // Add some smoke particles
    for (let i = 0; i < 10; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 20 + Math.random() * 40;

      this.addParticle({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 30,
        size: 6 + Math.random() * 8,
        color: '#666',
        life: 0.8 + Math.random() * 0.4,
        maxLife: 0.8 + Math.random() * 0.4,
        alpha: 0.5,
        shape: 'circle',
        gravity: -20,
        shrink: false
      });
    }
  }

  createImpact(x, y, color = '#4a9eff', count = 8) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.3;
      const speed = 80 + Math.random() * 80;

      this.addParticle({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 3,
        color: this.varyColor(color),
        life: 0.3 + Math.random() * 0.3,
        maxLife: 0.3 + Math.random() * 0.3,
        alpha: 1,
        shape: 'circle',
        gravity: 100,
        shrink: true
      });
    }
  }

  createTrail(x, y, vx, vy, color = '#4a9eff', count = 3) {
    for (let i = 0; i < count; i++) {
      this.addParticle({
        x: x + (Math.random() - 0.5) * 5,
        y: y + (Math.random() - 0.5) * 5,
        vx: vx * 0.1 + (Math.random() - 0.5) * 20,
        vy: vy * 0.1 + (Math.random() - 0.5) * 20,
        size: 2 + Math.random() * 2,
        color: this.varyColor(color),
        life: 0.2 + Math.random() * 0.2,
        maxLife: 0.2 + Math.random() * 0.2,
        alpha: 0.6,
        shape: 'circle',
        gravity: 0,
        shrink: true
      });
    }
  }

  createBlood(x, y, count = 15) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 100;

      this.addParticle({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 50,
        size: 2 + Math.random() * 3,
        color: this.varyColor('#8b0000'),
        life: 0.8 + Math.random() * 0.4,
        maxLife: 0.8 + Math.random() * 0.4,
        alpha: 1,
        shape: 'circle',
        gravity: 300,
        shrink: false
      });
    }
  }

  createHeal(x, y, count = 12) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = 40 + Math.random() * 40;

      this.addParticle({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 100,
        size: 3 + Math.random() * 3,
        color: this.varyColor('#00ff00'),
        life: 0.8 + Math.random() * 0.4,
        maxLife: 0.8 + Math.random() * 0.4,
        alpha: 1,
        shape: 'circle',
        gravity: -50,
        shrink: true
      });
    }

    // Add sparkles
    for (let i = 0; i < 6; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 60;

      this.addParticle({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 80,
        size: 2,
        color: '#ffffff',
        life: 0.5,
        maxLife: 0.5,
        alpha: 1,
        shape: 'circle',
        gravity: 0,
        shrink: false
      });
    }
  }

  createPickup(x, y, color = '#daa520') {
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8;
      const speed = 80;

      this.addParticle({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 50,
        size: 4,
        color: this.varyColor(color),
        life: 0.6,
        maxLife: 0.6,
        alpha: 1,
        shape: 'square',
        gravity: 0,
        shrink: true
      });
    }
  }

  createDust(x, y, count = 5) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 20 + Math.random() * 30;

      this.addParticle({
        x: x + (Math.random() - 0.5) * 10,
        y: y + (Math.random() - 0.5) * 10,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 10,
        size: 2 + Math.random() * 2,
        color: '#8a8a8a',
        life: 0.5 + Math.random() * 0.3,
        maxLife: 0.5 + Math.random() * 0.3,
        alpha: 0.4,
        shape: 'circle',
        gravity: 0,
        shrink: true
      });
    }
  }

  createSpark(x, y, count = 6) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 150 + Math.random() * 100;

      this.addParticle({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2,
        color: '#ffff00',
        life: 0.3,
        maxLife: 0.3,
        alpha: 1,
        shape: 'line',
        gravity: 200,
        shrink: false
      });
    }
  }

  addParticle(particle) {
    // Prevent too many particles
    if (this.particles.length >= this.maxParticles) {
      this.particles.shift(); // Remove oldest
    }

    this.particles.push(particle);
  }

  clear() {
    this.particles = [];
  }

  // Helper to vary color slightly for more natural look
  varyColor(hexColor) {
    // Parse hex color
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);

    // Add variation
    const variation = 30;
    const newR = Math.max(0, Math.min(255, r + (Math.random() - 0.5) * variation));
    const newG = Math.max(0, Math.min(255, g + (Math.random() - 0.5) * variation));
    const newB = Math.max(0, Math.min(255, b + (Math.random() - 0.5) * variation));

    // Convert back to hex
    return `#${Math.floor(newR).toString(16).padStart(2, '0')}${Math.floor(newG).toString(16).padStart(2, '0')}${Math.floor(newB).toString(16).padStart(2, '0')}`;
  }

  getParticleCount() {
    return this.particles.length;
  }
}
