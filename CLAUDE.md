# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Setup
```bash
npm run setup          # Install all dependencies (client + server)
```

### Development (requires Docker)
```bash
npm run dev            # Start all services with hot reload via Docker Compose
npm run down           # Stop all services
npm run down:clean     # Stop and remove all containers, images, volumes
```

### Testing
```bash
npm test               # Run all tests (client + server)
npm run test:client    # Run client tests only (vitest)
npm run test:server    # Run server tests only (vitest)

# Run a single test file:
cd client && npx vitest run src/__tests__/ScribbleRound.test.ts
cd server && npx vitest run src/__tests__/Room.test.ts
```

### Linting & Formatting
```bash
npm run lint           # Lint .ts and .svelte files
npm run lint:fix       # Auto-fix lint issues
npm run format         # Format all files with Prettier
npm run format:check   # Check formatting without writing
```

### Building
```bash
npm run build          # Build both client and server
```

### Production / Playtests
```bash
npm run prod           # Run production Docker build
npm run playtest       # Run playtest Docker build (dev + playtest overrides)
```

## Environment

Copy `.env.sample` to `.env` before running. Ports can be changed to resolve conflicts. The app runs at `http://localhost` (nginx port) with the backend at `http://localhost/api`.

## Architecture

This is a **Svelte + Node.js websocket multiplayer game** using Docker + Nginx for routing.

### Monorepo Layout
- **`client/`** — Svelte 5 frontend (Vite, Vitest, TypeScript)
- **`server/`** — Node.js backend (Express + `ws` WebSocket library, TypeScript)
- **`shared/`** — Code shared between client and server (actions, round definitions)
- **`nginx/`** — Nginx config routes `/api` to the server and everything else to the client

### Shared Module (`shared/`)
The `shared/` package is the communication contract between client and server. Import it as `@shared/actions` and `@shared/rounds`.

- **`shared/actions/index.ts`** — Defines `ActionEnum`, all `Action` subclasses (e.g. `SendDrawingAction`, `StartRoundAction`), the `ActionTarget` base class (used by both `ClientWebsocket` and `Player`), and `ParseAction`. To add a new action: add to `ActionEnum`, create a class extending `Action<Payload>`, add to `AnyAction` union, and add to the `Actions` object.
- **`shared/rounds/index.ts`** — Defines `RoundEnum` and all `Round` subclasses with their timeouts and metadata. The ordered `Rounds` array is the source of truth for game sequence.

### Server Architecture
- **`server/src/index.ts`** — Express + WebSocket server entry. Reads `SERVER_PORT` from env.
- **`server/src/lib/scripts/roomless-handler.ts`** — Handles unauthenticated WebSocket connections. Routes `CREATE_ROOM` / `JOIN_ROOM` actions, and handles reconnection via cookie/query param `playerId`.
- **`server/src/lib/components/Room.ts`** — Manages players in a room, host promotion on disconnect, and delegates `START_GAME` to `Game`.
- **`server/src/lib/components/Game.ts`** — Runs the round loop: initializes `ServerRound[]`, calls `setup()`, broadcasts `StartRound`/`EndRound`, waits for all players to respond or timeout.
- **`server/src/lib/components/rounds/ServerRound.ts`** — Abstract base for server-side rounds. Each must implement `expectedActions` and `roundResponseHandler`.
- **`server/src/lib/components/rounds/Rounds.ts`** — `initializeRounds()` builds the ordered list of `ServerRound` instances.

### Client Architecture
- **`client/src/lib/ClientWebsocket.ts`** — Singleton `ActionTarget` wrapping the browser `WebSocket`. Auto-reconnects and stores `playerId` in a cookie.
- **`client/src/lib/Navigator.ts`** — Svelte store for the current view (`ROOM_FORM` | `LOBBY` | `GAME`).
- **`client/src/lib/GameState.ts`** — Global Svelte stores (`playerName`, `roomName`, `isHost`, `drawingImage`, etc.) wired to WebSocket action listeners via `resetState()`.
- **`client/src/lib/stores/roundStore.ts`** — Tracks current round state (`RoundState`). `startNextRound()` / `jumpToRound()` advance the client through rounds in sync with server `StartRound` actions.
- **`client/src/lib/constants/RoundTypeComponentDict.ts`** — Maps every `RoundEnum` to its Svelte component. When adding a new round, register it here.

### Adding a New Round
1. Add to `RoundEnum` and create a `Round` subclass in `shared/rounds/index.ts`, add it to the `Rounds` array.
2. Create a `ServerXRound` extending `ServerRound` in `server/src/lib/components/rounds/`.
3. Register it in `server/src/lib/components/rounds/Rounds.ts` `initializeRounds()`.
4. Create a Svelte component in `client/src/lib/components/rounds/`.
5. Register it in `client/src/lib/constants/RoundTypeComponentDict.ts`.

### TypeScript Quirks
The server has **two tsconfig files**: `tsconfig.json` (root `..` for local dev) and `docker.tsconfig.json` (root `.` for Docker, where `shared/` is copied in). Keep them in sync when modifying compiler options.

Shared code is imported with `@shared/*` path aliases — configured in both `client/tsconfig.json` and `server/tsconfig.json`.

---

## Connection & Reconnection System

### How reconnection works (server)
- Each `Player` has a stable UUID (`player.id`) and `lastUploadedImage` (their most recent drawing, updated by round setup and submission).
- On disconnect, `Room.deactivatePlayer()` marks `player.disconnected = true` and starts a 3-minute cleanup timer. The player's slot is preserved.
- On reconnect (`handleNewConnection` in `roomless-handler.ts`), the server looks up the player by `playerId` query param. If found, `Player.reconnect(ws, room)` is called:
  1. Old WS listeners are removed; new WS is attached via `setWebsocket()`, which re-attaches all `#actionListeners` to the new socket.
  2. Server sends `JoinRoom` → `StartGame(currentRoundNumber, remainingTimer)` → `SendDrawing(playerDrawings[id])` → `sendReconnectState()` → `PlayerListChange` → `HostChange`.
- `playerDrawings[id]` stores the last image the player **submitted** (may be from a previous round). `player.lastUploadedImage` is always the current round's starting canvas. `sendReconnectState` is the right place for round-specific reconnect state.

### How reconnection works (client)
- `ClientWebsocket` auto-reconnects on `onclose` with a 1s delay. It sends its `playerId` (stored in `sessionStorage`, per-tab) as a query param on the new connection.
- On receiving `JoinRoom`, the client navigates to LOBBY (briefly), then `StartGame` jumps it back to the correct round via `jumpToRound(currentRound - 1, timer)`.
- **Important**: `Lobby.svelte` is briefly mounted during reconnect. It must NOT add a `START_GAME` listener that sends `StartGame` back to the server — that would trigger a new game while one is already running (or log "Not enough players").

### ActionTarget listener system
- `addActionListener(actionType, fn)` **adds** a listener (multiple listeners per type are supported, stored in `#actionListeners`).
- `removeActionListener(actionType)` **removes ALL** listeners for that type — not just one. This is a footgun: any component calling `removeActionListener(END_ROUND)` in its cleanup also destroys listeners registered by other components (e.g., `Game.svelte`'s `handleServerEndRound`).
- `setWebsocket(ws)` re-attaches all `#actionListeners` to the new WS, so reconnecting preserves round listeners.

### Round lifecycle (client-side END_ROUND listener chain)
There are **multiple** `END_ROUND` listeners active at once while a round is ongoing:
1. `Game.svelte` (onMount): calls `endCurrentRound()`
2. `Round.svelte` (onMount): calls `onRoundEnd()` + `endCurrentRound()`
3. `DrawingRound.svelte` (onMount): calls `handleRoundEnd()` (sends `SEND_DRAWING`)

When a player submits early, `endCurrentRound()` sets `ongoing = false`, unmounting the round components. `Round.svelte`'s cleanup calls `removeActionListener(END_ROUND)`, which **removes all END_ROUND listeners including `Game.svelte`'s**. From that point on, server-sent `END_ROUND` messages for the rest of that round boundary are silently ignored on this client — the `START_ROUND` listener in `Game.svelte` is untouched and advances the round correctly.

### Local testing
Multiple players can be tested using separate tabs on the same browser. `playerId` is stored in `sessionStorage` (per-tab), so each tab maintains its own identity. No need for incognito windows or separate browsers.

### Known mysteries / open bugs
- **"a stays on Line round after timeout"**: When `a` submits early and `aa` hasn't, `a` sees "Great job! Wait for everyone else." After the line round times out, `aa` correctly advances to Color, but `a` has been observed staying stuck. The `startNextRound` call triggered by `START_ROUND` should still fire (Game.svelte's listener is independent of the END_ROUND cleanup). Root cause unconfirmed — may be a timing/race condition with the double `END_ROUND` sent at round boundaries (one at timeout, one from `nextRound()` 300ms before `START_ROUND`). There is already a `// TODO: fix race condition` comment in `Game.ts` about this.
