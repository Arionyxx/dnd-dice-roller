# 🎲 The Tavern Dice - D&D Dice Roller

A fantasy-themed multiplayer dice roller for D&D sessions with real-time updates!

## Features

- ⚔️ **Fantasy D&D Theme** - Immersive tavern/dungeon aesthetic
- 🎲 **Multiple Dice Types** - D4, D6, D8, D10, D12, D20
- 🤝 **Multiplayer Rooms** - Roll dice with your party in real-time
- 🔐 **User Authentication** - Signup/Login system
- ✨ **Smooth Animations** - Realistic dice rolling animations
- 📜 **Roll History** - See recent rolls from all party members
- 🎯 **Critical Detection** - Special alerts for crits and fails

## Getting Started

### Installation

1. Clone this repository
2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

4. Open your browser to `http://localhost:3000`

### For Development

```bash
npm run dev
```

## Deployment

### Deploy to Railway/Render/Heroku

1. Push your code to GitHub
2. Connect your repo to Railway/Render/Heroku
3. Set environment variable:
   - `JWT_SECRET`: A secure random string for JWT tokens
4. Deploy!

### Deploy Backend Separately

If you want to deploy the backend to Railway and frontend to Netlify:

1. Deploy `server.js` to Railway
2. Get your Railway URL (e.g., `https://your-app.railway.app`)
3. Update socket connection in `public/room.html`:
   ```javascript
   const socket = io('https://your-app.railway.app');
   ```
4. Deploy the `public` folder to Netlify

## How to Use

1. **Sign Up** - Create an account with a username and password
2. **Join Room** - You'll automatically get a room code
3. **Share Room** - Share the URL with your friends so they can join
4. **Roll Dice** - Select a dice type and click ROLL!
5. **See Results** - Watch as everyone's rolls appear in real-time

## Room Sharing

Share your room URL with friends:
```
http://localhost:3000/room.html?room=ABCD12
```

Everyone in the same room will see each other's rolls!

## Tech Stack

- **Backend**: Node.js, Express, Socket.IO
- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Auth**: JWT, bcrypt
- **Real-time**: Socket.IO

## Security Note

⚠️ **IMPORTANT**: Change the `JWT_SECRET` in production! Set it as an environment variable:

```bash
export JWT_SECRET="your-very-secure-random-string-here"
```

## License

MIT

---

Made with ⚔️ for tabletop adventurers!
