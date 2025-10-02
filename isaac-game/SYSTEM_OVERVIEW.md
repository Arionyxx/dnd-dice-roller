# System Overview - Game Architecture

## File Dependencies

```
index.html
    └── js/main.js
            └── js/game.js
                    ├── js/input.js
                    ├── js/entities/player.js
                    ├── js/room.js
                    │       ├── js/entities/enemy.js
                    │       └── js/items.js
                    ├── js/dungeon.js
                    │       └── js/room.js
                    ├── js/particles.js
                    ├── js/audio.js
                    ├── js/collision.js
                    └── js/ui.js
```

## Data Flow

### Game Initialization
```
main.js
  → Create Game instance
  → Setup menu handlers
  → Wait for user input

User clicks "START"
  → game.start()
  → game.init()
      → Create DungeonGenerator
      → Generate dungeon layout
      → Create Player
      → Load first room
      → Initialize all systems
  → Start game loop
```

### Game Loop (60 FPS)
```
gameLoop()
  1. Calculate deltaTime
  2. Update (fixed timestep):
     ├── Player.update()
     │   ├── Process input (movement)
     │   ├── Update position
     │   ├── Handle shooting
     │   └── Update tears
     │
     ├── Room.update()
     │   ├── Update all enemies
     │   └── Remove dead enemies
     │
     ├── Check collisions:
     │   ├── Player vs Enemies
     │   ├── Tears vs Enemies
     │   ├── Enemy shots vs Player
     │   └── Player vs Items
     │
     ├── Check room transitions
     ├── ParticleSystem.update()
     └── Update camera shake

  3. Render:
     ├── Clear canvas
     ├── Apply camera shake
     ├── Room.render()
     │   ├── Floor tiles
     │   ├── Walls
     │   ├── Obstacles
     │   ├── Items
     │   ├── Enemies
     │   └── Doors
     ├── Player.render()
     └── ParticleSystem.render()
```

## System Interactions

### Combat System
```
Player shoots
  → Create tear object
  → Audio.play('shoot')

Collision detected (tear vs enemy)
  → Enemy.takeDamage()
  → Particles.createImpact()
  → Check if enemy died
      → Particles.createExplosion()
      → Audio.play('enemyDeath')
      → Maybe drop pickup
      → Update stats
      → Update UI
```

### Room Clearing
```
Enemy dies
  → Room.enemies array updated
  → Check if enemies.length === 0
      → Room.cleared = true
      → Doors change color
      → Player can exit
```

### Room Transition
```
Player near door + No enemies
  → game.transitionRoom(direction)
      → Mark current room cleared
      → Dungeon.move(direction)
      → Get new room
      → If not visited:
          → Room.generate()
              → Spawn enemies
              → Spawn obstacles
              → Maybe spawn item
      → Reposition player
      → UI.updateMinimap()
```

### Item Pickup
```
Player touches item
  → game.pickupItem(item)
      → item.effect(player, game)
      → Modify player stats
      → Remove from room
      → UI.showItemPickup()
      → Audio.play('itemPickup')
      → UI.update()
```

## System Responsibilities

### Game.js (Game Manager)
- Owns all systems
- Runs game loop
- Handles state transitions
- Coordinates between systems
- Manages current room
- Tracks game statistics

### Player.js
- Movement logic
- Shooting mechanics
- Health management
- Invulnerability frames
- Tear generation
- Rendering self and tears

### Enemy.js
- Base enemy behavior
- AI update logic
- Damage handling
- Death handling
- Pickup spawning
- Three enemy types (Fly, Shooter, Charger)

### Room.js
- Content generation
- Enemy spawning
- Item placement
- Obstacle generation
- Door management
- Rendering floor/walls/doors

### Dungeon.js
- Procedural generation
- Grid-based layout
- Room connections
- Special room placement
- Navigation methods
- Minimap data

### Collision.js
- Circle-circle detection
- Circle-rect detection
- Rect-rect detection
- Helper collision functions
- Pure logic (no state)

### Particles.js
- Visual effect generation
- Particle lifecycle
- Multiple effect types
- Performance management
- Rendering effects

### Audio.js
- Procedural sound generation
- Web Audio API management
- Sound effect library
- Volume control
- Browser compatibility handling

### UI.js
- DOM manipulation
- Heart display
- Stats display
- Minimap rendering
- Notifications
- Message system

### Items.js
- Item definitions
- Effect functions
- Rarity system
- Helper functions
- No state (data only)

### Input.js
- Keyboard handling
- Mouse handling
- Movement vector
- Key state tracking
- Browser event listeners

## State Management

### Game State
```javascript
{
  running: boolean,
  paused: boolean,
  gameStats: {
    floor: number,
    roomsCleared: number,
    enemiesKilled: number,
    keys: number,
    bombs: number
  },
  camera: {
    x, y,
    shake: number,
    shakeDecay: number
  }
}
```

### Player State
```javascript
{
  x, y,              // Position
  radius,            // Collision
  health,            // Current HP
  maxHealth,         // Max HP
  speed,             // Movement speed
  damage,            // Tear damage
  tearDelay,         // Fire rate
  tearSpeed,         // Projectile speed
  range,             // Max distance
  tears: [],         // Active projectiles
  invulnerable,      // Damage immunity
  invulnerableTime   // Immunity duration
}
```

### Room State
```javascript
{
  x, y,              // Grid position
  type,              // Room type
  visited,           // Has been entered
  cleared,           // All enemies dead
  enemies: [],       // Active enemies
  items: [],         // Available items
  obstacles: [],     // Rocks, etc
  doors: {           // Connections
    north, south,
    east, west
  }
}
```

### Enemy State (Base)
```javascript
{
  x, y,              // Position
  radius,            // Collision
  health,            // Current HP
  maxHealth,         // Max HP
  speed,             // Movement speed
  alive,             // Is active
  stunned,           // Hit reaction
  color,             // Visual
  animationTime      // Animation state
}
```

## Performance Considerations

### Optimization Strategies
1. **Fixed timestep** - Consistent physics regardless of FPS
2. **Particle cap** - Max 500 particles to prevent memory issues
3. **Culling** - Dead entities removed immediately
4. **Array filtering** - Clean up arrays each frame
5. **No allocations in loops** - Reuse objects where possible

### Memory Management
- Particles auto-cleanup when dead
- Enemies removed from arrays on death
- Tears removed when out of range
- Rooms persist (no regeneration)

### Rendering Optimization
- Single canvas context
- Minimize state changes
- Group similar draw calls
- Use canvas transforms for camera
- Simple shapes (circles, rects)

## Extension Points

Want to add features? Hook into these systems:

### New Enemy Type
```javascript
// In js/entities/enemy.js
export class NewEnemy extends Enemy {
  constructor(x, y, game) {
    super(x, y, 'newtype', game);
    // Set stats
  }

  updateBehavior(dt) {
    // Custom AI
  }

  render(ctx) {
    // Custom appearance
  }
}
```

### New Item
```javascript
// In js/items.js
{
  id: 'unique_id',
  name: 'Display Name',
  description: 'What it does',
  rarity: 'common',
  effect: (player, game) => {
    // Modify player stats
    player.speed += 50;
  }
}
```

### New Room Type
```javascript
// In js/room.js
generateCustomRoom(game) {
  // Spawn custom enemies
  // Place custom items
  // Add custom obstacles
}
```

### New Particle Effect
```javascript
// In js/particles.js
createCustomEffect(x, y, color) {
  for (let i = 0; i < count; i++) {
    this.addParticle({
      x, y,
      vx, vy,
      size, color,
      life, maxLife,
      // ... properties
    });
  }
}
```

### New Sound
```javascript
// In js/audio.js
generateCustomSound(volume = 1.0) {
  const now = this.audioContext.currentTime;
  // Create oscillators, noise
  // Set envelopes
  // Connect to masterGain
}
```

## Testing Checklist

- [ ] Game starts without errors
- [ ] Player movement works (WASD/Arrows)
- [ ] Player shooting works (mouse click)
- [ ] Enemies spawn in rooms
- [ ] Enemies move and behave correctly
- [ ] Collisions detect properly
- [ ] Player takes damage
- [ ] Enemies take damage
- [ ] Enemies die and spawn particles
- [ ] Items spawn on pedestals
- [ ] Items can be picked up
- [ ] Item effects apply
- [ ] UI updates correctly
- [ ] Hearts display accurately
- [ ] Minimap shows rooms
- [ ] Doors lock/unlock
- [ ] Room transitions work
- [ ] Sound effects play
- [ ] Particle effects appear
- [ ] Game over screen appears
- [ ] Restart works correctly

## Debug Commands

Add to browser console while game is running:

```javascript
// Access game instance
window.game = game; // Add this in main.js

// Then in console:
game.player.health = 100;          // God mode
game.player.damage = 10;           // One-shot everything
game.player.tearDelay = 0.05;     // Extreme fire rate
game.currentRoom.enemies = [];     // Clear room
```

## Common Patterns

### Entity Update Pattern
```javascript
update(dt) {
  // Update position
  this.x += this.vx * dt;
  this.y += this.vy * dt;

  // Update timers
  this.timer -= dt;

  // Check states
  if (this.timer <= 0) {
    // Do something
  }

  // Update children
  for (const child of this.children) {
    child.update(dt);
  }

  // Cleanup
  this.children = this.children.filter(c => c.alive);
}
```

### Collision Check Pattern
```javascript
for (const a of listA) {
  for (const b of listB) {
    if (collision.check(a, b)) {
      // Handle collision
      a.onCollision(b);
      b.onCollision(a);
    }
  }
}
```

### Effect Creation Pattern
```javascript
createEffect(x, y, options = {}) {
  const defaults = {
    count: 10,
    color: '#ffffff',
    speed: 100,
    // ... other defaults
  };

  const config = { ...defaults, ...options };

  for (let i = 0; i < config.count; i++) {
    // Generate particles using config
  }
}
```

## Conclusion

This architecture provides:
- ✅ Clear separation of concerns
- ✅ Easy to extend and modify
- ✅ Minimal dependencies
- ✅ Predictable behavior
- ✅ Good performance
- ✅ Educational structure

All systems work together seamlessly to create a complete roguelike experience!
