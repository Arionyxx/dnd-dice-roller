// Input Manager
export class InputManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = {};
    this.keysPressed = new Set();
    this.mouse = { x: 0, y: 0, down: false, pressed: false };

    this.setupListeners();
  }

  setupListeners() {
    // Keyboard
    window.addEventListener('keydown', (e) => {
      if (!this.keys[e.key]) {
        this.keysPressed.add(e.key);
      }
      this.keys[e.key] = true;

      // Prevent default for game keys
      if (['w', 'a', 's', 'd', ' ', 'e', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key] = false;
      this.keysPressed.delete(e.key);
    });

    // Mouse
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
    });

    this.canvas.addEventListener('mousedown', (e) => {
      this.mouse.down = true;
      this.mouse.pressed = true;
    });

    this.canvas.addEventListener('mouseup', (e) => {
      this.mouse.down = false;
    });

    // Prevent context menu
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  isKeyDown(key) {
    return !!this.keys[key];
  }

  isKeyPressed(key) {
    if (this.keysPressed.has(key)) {
      this.keysPressed.delete(key);
      return true;
    }
    return false;
  }

  isMouseDown() {
    return this.mouse.down;
  }

  isMousePressed() {
    if (this.mouse.pressed) {
      this.mouse.pressed = false;
      return true;
    }
    return false;
  }

  getMousePosition() {
    return { x: this.mouse.x, y: this.mouse.y };
  }

  getMovementVector() {
    let x = 0;
    let y = 0;

    if (this.isKeyDown('w') || this.isKeyDown('ArrowUp')) y -= 1;
    if (this.isKeyDown('s') || this.isKeyDown('ArrowDown')) y += 1;
    if (this.isKeyDown('a') || this.isKeyDown('ArrowLeft')) x -= 1;
    if (this.isKeyDown('d') || this.isKeyDown('ArrowRight')) x += 1;

    // Normalize diagonal movement
    if (x !== 0 && y !== 0) {
      const len = Math.sqrt(x * x + y * y);
      x /= len;
      y /= len;
    }

    return { x, y };
  }
}
