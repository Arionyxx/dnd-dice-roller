# Tears of the Basement - Isaac-Style Roguelike

A browser-based roguelike dungeon crawler inspired by The Binding of Isaac, built with vanilla JavaScript and HTML5 Canvas.

## How to Run

1. Open `index.html` in a modern web browser
2. Click "START GAME" to begin
3. Use WASD or Arrow Keys to move
4. Aim with mouse and click to shoot
5. Clear all enemies in a room to unlock doors
6. Collect items to power up your character
7. Try to reach and defeat the boss!

## Game Systems

### Core Files

- **`index.html`** - Main HTML structure with UI elements and styling
- **`js/main.js`** - Entry point, handles menu interactions
- **`js/game.js`** - Main game loop, manages all systems and game state

### Game Systems

#### 1. Player System (`js/entities/player.js`)
- Player movement and shooting mechanics
- Health system with hearts (2 HP per heart)
- Tear (projectile) system with customizable stats
- Invulnerability frames after taking damage
- Stats: health, speed, damage, tear delay, tear speed, range

#### 2. Enemy System (`js/entities/enemy.js`)
- **Base Enemy Class** - Common enemy behavior and rendering
- **Fly** - Basic enemy that slowly chases the player
- **Shooter** - Ranged enemy that maintains distance and fires projectiles
- **Charger** - Aggressive enemy that charges in straight lines
- Each enemy has unique AI, health, damage, and visual appearance
- 15% chance to drop pickups (mostly hearts) on death

#### 3. Room System (`js/room.js`)
- Procedurally generates room contents (enemies, items, obstacles)
- Room types: normal, boss, treasure, shop, start
- Handles door rendering (locked/unlocked based on enemy count)
- Floor tile rendering with grid pattern
- Obstacle generation (rocks)
- Item pedestal rendering with rarity-based glow effects

#### 4. Dungeon System (`js/dungeon.js`)
- Procedural 2D grid-based dungeon generation
- 8-15 rooms per floor using depth-first generation
- Automatically places boss room (farthest from start)
- Places 1-2 treasure rooms randomly
- Connects rooms with doors
- Minimap data generation
- Room navigation methods

#### 5. Collision System (`js/collision.js`)
- **Circle-Circle** collision (player vs enemies, tears vs enemies)
- **Circle-Rectangle** collision (for future obstacles)
- **Rectangle-Rectangle** collision (AABB)
- Point collision detection
- Line-Circle collision (for raycasting)
- Sweep collision for moving objects
- Collision resolution with separation and velocity response

#### 6. Particle System (`js/particles.js`)
- Visual effects for impacts, explosions, trails
- **createExplosion()** - Large enemy death effects
- **createImpact()** - Tear hit effects
- **createTrail()** - Movement trails
- **createBlood()** - Gore effects
- **createHeal()** - Health pickup effects
- **createPickup()** - Item collection effects
- Particles have: position, velocity, color, lifetime, fade, shrink, gravity

#### 7. Audio System (`js/audio.js`)
- Procedural sound generation using Web Audio API
- No external audio files needed
- Sounds:
  - **shoot** - Quick pew sound
  - **enemyDeath** - Explosion with bass thump
  - **playerHurt** - Harsh descending tone
  - **itemPickup** - Ascending chime
  - **gameOver** - Sad descending melody
  - **explosion** - Noise-based explosion
  - **door** - Mechanical sound
  - **step** - Footstep click

#### 8. UI System (`js/ui.js`)
- Heart display (full, half, empty hearts)
- Stats panel (floor, rooms cleared, keys, bombs)
- Minimap showing explored rooms and current position
- Item pickup notifications with rarity colors
- Boss health bar support
- Damage numbers
- Temporary messages

#### 9. Items System (`js/items.js`)
- 16 unique items with varied effects
- **Rarity tiers**: common, uncommon, rare, special
- **Categories**:
  - Speed: Runner Shoes, Rocket Boots
  - Damage: Strength Pill, Power Crystal
  - Health: Max Health Up, Full Heal
  - Fire Rate: Rapid Fire, Machine Gun Tears
  - Range: Long Barrel, Sniper Scope
  - Shot Speed: Velocity Boost
  - Multi-stat: Golden Crown, Glass Cannon, Tank Armor
  - Utility: Guardian Angel, Giant Tears

### Input System (`js/input.js`)
- Keyboard input (WASD, Arrow Keys, Space, E, Escape)
- Mouse input (position, click, hold)
- Movement vector normalization for diagonal movement
- Key pressed vs key down distinction

## Game Balance

### Player Starting Stats
- Health: 6 HP (3 hearts)
- Speed: 200 pixels/second
- Damage: 1.0
- Tear Delay: 0.3 seconds
- Tear Speed: 400 pixels/second
- Range: 300 pixels
- Invulnerability: 1 second after hit

### Enemy Stats

**Fly**
- Health: 2
- Speed: 80
- Behavior: Slowly chases player with bobbing motion

**Shooter**
- Health: 3
- Speed: 60
- Behavior: Maintains 200px distance, shoots every 2 seconds

**Charger**
- Health: 4
- Speed: 50 (350 when charging)
- Behavior: Charges in straight lines, 2-second cooldown

### Room Generation
- 3-7 enemies per normal room
- 2-4 rock obstacles per room
- Enemy type weights: Fly (50%), Shooter (30%), Charger (20%)
- 5% chance for item pedestal in normal rooms
- 100% item in treasure rooms

### Item Rarity Weights
- Common: 50%
- Uncommon: 30%
- Rare: 15%
- Special: 5%

## Architecture

### Game Loop
- Fixed timestep update at 60 FPS
- Delta time accumulator for consistent physics
- Separate update and render phases
- Camera shake system for impact feedback

### Collision Detection Order
1. Player vs enemies (contact damage)
2. Player tears vs enemies
3. Enemy projectiles vs player
4. Player vs items (pickup)
5. Player vs walls (bounds checking)
6. Tears vs walls (despawn)

### Room Transitions
1. Check if all enemies are cleared
2. Check if player is near a door
3. Verify door exists in that direction
4. Mark current room as cleared
5. Move to adjacent room
6. Generate new room if unvisited
7. Position player at opposite door
8. Update minimap

## Future Enhancements

Potential additions:
- Boss enemies with multiple phases
- More item types (passive, active, trinkets)
- Special room types (curse, devil deal, angel)
- Item synergies
- Unlockable characters
- Achievements system
- Multiple floors
- Save/load system
- More enemy types
- Obstacles that block movement
- Keys and locked doors
- Bombs and destructible rocks
- Coins and shop system

## Browser Compatibility

Tested on:
- Chrome/Edge (Chromium)
- Firefox
- Safari (WebKit)

Requires:
- ES6 module support
- Canvas API
- Web Audio API

## Credits

Inspired by The Binding of Isaac by Edmund McMillen.
All code and assets created as a learning exercise.

## License

Free to use and modify for educational purposes.
