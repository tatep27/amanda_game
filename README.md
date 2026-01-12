# Amanda

A 2D web game with multiplayer support, built with Phaser 3 and TypeScript.

## Project Structure

This is a monorepo containing two packages:

- **`client/`** - The game client (Phaser 3 + Vite + TypeScript)
- **`server/`** - The multiplayer server (Node.js, to be implemented in Phase 7)

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

## Getting Started

### Installation

From the repository root, install all dependencies:

```bash
npm install
```

This will install dependencies for both the client and server packages.

### Running the Client

Start the Vite development server for the game client:

```bash
npm run client
```

The game will automatically open in your browser at `http://localhost:3000`.

You should see:
- A Phaser canvas rendering correctly
- Title text "Amanda"
- Status text showing "Phaser is running ✓"
- No console errors

### Running the Server

Start the placeholder server:

```bash
npm run server
```

The server will log that it's running. (Note: This is a placeholder until Phase 7 when multiplayer is implemented.)

## Development

### Client Scripts

From the `client/` directory:

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Project Status

**Current Phase:** Phase 0 - Foundation skeleton ✅

**Completed:**
- ✅ Monorepo setup with npm workspaces
- ✅ Vite + TypeScript + Phaser 3 client
- ✅ Boot → Preload → World scene flow
- ✅ Server placeholder
- ✅ Development environment

**Next Steps:** See `FOUNDATION_ROADMAP.md` for the full development plan.

## Technology Stack

### Client
- **Phaser 3** - Game framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server

### Server (Phase 7)
- **Node.js** - JavaScript runtime
- **WebSockets** - Real-time communication (Colyseus or Socket.IO)

## Deployment (Future)

- **Client:** Vercel (static hosting)
- **Server:** Fly.io / Render / Railway (WebSocket support)

## License

Private project.

