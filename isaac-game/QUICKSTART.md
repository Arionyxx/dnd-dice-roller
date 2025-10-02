# Quick Start Guide

## Running the Game

1. **Simple Method**: Double-click `index.html` to open in your default browser
2. **Development Method**: Use a local server (recommended for best compatibility)
   - Python 3: `python -m http.server 8000`
   - Node.js: `npx http-server`
   - VS Code: Use "Live Server" extension

## Controls

| Action | Keys |
|--------|------|
| Move | WASD or Arrow Keys |
| Shoot | Mouse Click (aim with mouse) |
| Pause | ESC |
| Use Bomb | SPACE (future feature) |
| Active Item | E (future feature) |

## First Playthrough Tips

1. **Learn Enemy Patterns**
   - Flies: Chase you slowly - easy to kite
   - Shooters: Keep distance - dodge their red projectiles
   - Chargers: Watch for red glow before they charge

2. **Combat Strategy**
   - Keep moving constantly
   - Use walls for cover against Shooters
   - Bait Chargers into walls
   - Don't get cornered

3. **Item Priority**
   - Early game: Take any item you find
   - **Best items**: Fire rate, damage, health
   - **Risky**: Glass Cannon (high damage, only 1 heart)
   - **Safe**: Tank Armor (more health, slower)

4. **Room Management**
   - Clear all enemies to open doors
   - Treasure rooms have guaranteed items
   - Boss room is red on minimap
   - You can backtrack through cleared rooms

## Common Issues

### Game doesn't start
- **Check console** (F12) for errors
- Make sure you're using a modern browser
- Try using a local server instead of file://

### No sound
- Check browser permissions (some block autoplay)
- Click anywhere on the page to activate audio context
- Check browser console for Web Audio API errors

### Performance issues
- Close other browser tabs
- The game targets 60 FPS
- Particle count is capped at 500 for performance

### Enemies not spawning
- This is normal for the starting room
- Move through a door to enter a room with enemies
- Doors only open when all enemies are dead

### Can't pick up items
- Walk directly over the item pedestal
- Make sure you're in the center of it
- Item name will appear at bottom of screen

## File Structure

```
isaac-game/
├── index.html          # Main HTML file - OPEN THIS
├── README.md           # Full documentation
├── QUICKSTART.md       # This file
└── js/
    ├── main.js         # Entry point
    ├── game.js         # Game loop & manager
    ├── input.js        # Input handling
    ├── room.js         # Room generation
    ├── dungeon.js      # Dungeon generation
    ├── collision.js    # Collision detection
    ├── particles.js    # Visual effects
    ├── audio.js        # Sound generation
    ├── ui.js           # UI updates
    ├── items.js        # Item definitions
    └── entities/
        ├── player.js   # Player logic
        └── enemy.js    # Enemy types
```

## Gameplay Loop

1. Start in empty starting room
2. Move through door to next room
3. Fight enemies until room is clear
4. Doors unlock when room is cleared
5. Collect items to power up
6. Explore all rooms
7. Fight boss in red room on minimap
8. Try to survive as long as possible!

## Debug Info

Open browser console (F12) to see:
- Dungeon generation info
- Number of rooms generated
- Any errors or warnings

## Modding Tips

Want to customize the game?

### Easy Changes:
- **`js/items.js`** - Add new items, change effects
- **`js/entities/player.js`** - Change starting stats (lines 10-16)
- **`js/entities/enemy.js`** - Adjust enemy health/speed/damage
- **`js/room.js`** - Change enemy spawn counts (line 48)

### Color Customization:
- **Player**: Line 135 in `player.js` - `#f5d7a1`
- **Tears**: Line 114 in `player.js` - `#4a9eff`
- **Floor**: Line 42 in `room.js` - `#2a2a2a`
- **Walls**: Line 94 in `room.js` - `#5a3a1a`

### Balance Tweaks:
```javascript
// In js/entities/player.js (constructor):
this.maxHealth = 6;      // Starting health
this.speed = 200;        // Movement speed
this.damage = 1;         // Tear damage
this.tearDelay = 0.3;    // Fire rate (lower = faster)
this.tearSpeed = 400;    // Projectile speed
this.range = 300;        // Tear distance
```

## Known Limitations

- Single floor only (no floor transitions yet)
- No save/load system
- Boss room just has multiple enemies (no unique boss)
- Keys and bombs tracked but not used yet
- Shop rooms spawn items but no cost system
- No item synergies (planned for future)

## Next Steps

Once you're comfortable:
1. Try to find all item types
2. Experiment with different builds
3. Challenge yourself to clear all rooms
4. Modify the code to add your own features!

## Getting Help

If something's not working:
1. Check browser console (F12) for errors
2. Verify all files are in correct locations
3. Try a different browser
4. Make sure JavaScript is enabled
5. Check README.md for more details

## Have Fun!

This is a learning project - feel free to:
- Modify the code
- Add new features
- Break things and fix them
- Learn how game systems work together

Happy dungeon crawling! 🎮
