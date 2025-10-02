// Dungeon Generator - Procedural dungeon generation

import { Room } from './room.js';

export class DungeonGenerator {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.grid = [];
    this.rooms = [];

    // Current position
    this.currentX = 0;
    this.currentY = 0;

    // Special room positions
    this.startRoom = null;
    this.bossRoom = null;
    this.treasureRooms = [];
  }

  generate() {
    // Initialize empty grid
    this.grid = Array(this.height).fill(null).map(() =>
      Array(this.width).fill(null)
    );

    // Start from center
    this.currentX = Math.floor(this.width / 2);
    this.currentY = Math.floor(this.height / 2);

    // Create starting room
    this.startRoom = new Room(this.currentX, this.currentY, 'start');
    this.grid[this.currentY][this.currentX] = this.startRoom;
    this.rooms.push(this.startRoom);

    // Generate room layout using depth-first approach
    const minRooms = 8;
    const maxRooms = 15;
    const targetRooms = Math.floor(Math.random() * (maxRooms - minRooms + 1)) + minRooms;

    this.generateRooms(this.currentX, this.currentY, targetRooms);

    // Place special rooms
    this.placeBossRoom();
    this.placeTreasureRooms();

    // Connect rooms (set door flags)
    this.connectRooms();

    console.log(`Generated dungeon with ${this.rooms.length} rooms`);
  }

  generateRooms(x, y, targetCount) {
    if (this.rooms.length >= targetCount) return;

    // Get possible directions
    const directions = [
      { dx: 0, dy: -1, name: 'north' },
      { dx: 0, dy: 1, name: 'south' },
      { dx: 1, dy: 0, name: 'east' },
      { dx: -1, dy: 0, name: 'west' }
    ];

    // Shuffle directions for randomness
    for (let i = directions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [directions[i], directions[j]] = [directions[j], directions[i]];
    }

    // Try each direction
    for (const dir of directions) {
      if (this.rooms.length >= targetCount) break;

      const newX = x + dir.dx;
      const newY = y + dir.dy;

      // Check if valid position
      if (newX < 0 || newX >= this.width || newY < 0 || newY >= this.height) continue;
      if (this.grid[newY][newX] !== null) continue;

      // Random chance to create room (creates branching)
      if (Math.random() < 0.7) {
        const room = new Room(newX, newY, 'normal');
        this.grid[newY][newX] = room;
        this.rooms.push(room);

        // Recursively generate from this room
        this.generateRooms(newX, newY, targetCount);
      }
    }
  }

  placeBossRoom() {
    // Find room farthest from start
    let maxDist = 0;
    let farthestRoom = null;

    for (const room of this.rooms) {
      if (room === this.startRoom) continue;

      const dist = Math.abs(room.x - this.startRoom.x) + Math.abs(room.y - this.startRoom.y);
      if (dist > maxDist) {
        maxDist = dist;
        farthestRoom = room;
      }
    }

    if (farthestRoom) {
      farthestRoom.type = 'boss';
      this.bossRoom = farthestRoom;
    }
  }

  placeTreasureRooms() {
    // Place 1-2 treasure rooms
    const treasureCount = Math.random() < 0.5 ? 1 : 2;

    const normalRooms = this.rooms.filter(r => r.type === 'normal');

    for (let i = 0; i < treasureCount && normalRooms.length > 0; i++) {
      const index = Math.floor(Math.random() * normalRooms.length);
      const room = normalRooms[index];
      room.type = 'treasure';
      this.treasureRooms.push(room);
      normalRooms.splice(index, 1);
    }
  }

  connectRooms() {
    // Set door flags for each room based on adjacent rooms
    for (const room of this.rooms) {
      const x = room.x;
      const y = room.y;

      // Check each direction
      if (y > 0 && this.grid[y - 1][x]) {
        room.doors.north = true;
      }
      if (y < this.height - 1 && this.grid[y + 1][x]) {
        room.doors.south = true;
      }
      if (x < this.width - 1 && this.grid[y][x + 1]) {
        room.doors.east = true;
      }
      if (x > 0 && this.grid[y][x - 1]) {
        room.doors.west = true;
      }
    }
  }

  getCurrentRoom() {
    return this.grid[this.currentY][this.currentX];
  }

  canMove(direction) {
    const room = this.getCurrentRoom();
    if (!room) return false;

    switch (direction) {
      case 'north':
        return room.doors.north && this.currentY > 0;
      case 'south':
        return room.doors.south && this.currentY < this.height - 1;
      case 'east':
        return room.doors.east && this.currentX < this.width - 1;
      case 'west':
        return room.doors.west && this.currentX > 0;
      default:
        return false;
    }
  }

  move(direction) {
    if (!this.canMove(direction)) return false;

    switch (direction) {
      case 'north':
        this.currentY--;
        break;
      case 'south':
        this.currentY++;
        break;
      case 'east':
        this.currentX++;
        break;
      case 'west':
        this.currentX--;
        break;
    }

    return true;
  }

  getGridForMinimap() {
    // Return grid data for minimap rendering
    return {
      grid: this.grid,
      width: this.width,
      height: this.height,
      currentX: this.currentX,
      currentY: this.currentY
    };
  }

  getRoomAt(x, y) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return null;
    }
    return this.grid[y][x];
  }

  // Get adjacent rooms (for pathfinding or other logic)
  getAdjacentRooms(room) {
    const adjacent = [];
    const directions = [
      { dx: 0, dy: -1, door: 'north' },
      { dx: 0, dy: 1, door: 'south' },
      { dx: 1, dy: 0, door: 'east' },
      { dx: -1, dy: 0, door: 'west' }
    ];

    for (const dir of directions) {
      if (room.doors[dir.door]) {
        const adjRoom = this.getRoomAt(room.x + dir.dx, room.y + dir.dy);
        if (adjRoom) {
          adjacent.push({ room: adjRoom, direction: dir.door });
        }
      }
    }

    return adjacent;
  }

  // Get explored room percentage
  getExplorationPercent() {
    const visited = this.rooms.filter(r => r.visited).length;
    return Math.floor((visited / this.rooms.length) * 100);
  }

  // Get cleared room percentage
  getClearPercent() {
    const cleared = this.rooms.filter(r => r.cleared || r.type === 'start').length;
    return Math.floor((cleared / this.rooms.length) * 100);
  }
}
