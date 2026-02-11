# Scribble Beasts — User Guide

This quick user guide helps players install (or run) the game locally, join or create rooms, and play. It avoids technical jargon and focuses on the essential steps and common problems.

## Who this is for

This guide is for people who want to play Scribble Beasts in a browser (desktop or mobile). You don't need developer skills — just follow the Quick Start.

## Quick Start (recommended: Docker)

1. Clone or download this repository.
2. From the project root, use Docker Compose to start both server and client (recommended for playtests):

```bash
# from the repo root
npm install
npm run dev
```

3. Wait for services to start. The client will print an address (for example `http://localhost` or the address from your compose logs). Open that address in a modern browser (Chrome, Edge, Firefox, or Safari).

Notes
- Node: if running locally without Docker, use Node 18+ for the project tools.
- Ports: the project uses ports configured in `docker-compose.*.yml` files — check those files if a port conflict occurs.

## Play on the hosted site (scribble-beasts.com)

If you'd rather not run anything locally, you can play on our hosted instance at:

https://scribble-beasts.com

Steps to play on the hosted site:

1. Open a modern browser and go to `https://scribble-beasts.com`.
2. On the landing page you can either Create Room (host) or Join an existing room using a room code or the lobby list.
3. If you create a room, share the room code or link with friends so they can join.
4. The rest of the gameplay is the same as the local Quick Start — follow the on-screen prompts to draw, line, color, or name creatures.

Notes about the hosted site:

- No local hosting required — everything runs on the hosted server.
- Your display name and any gameplay actions are shared with other players in the room; avoid sharing personal data if you want privacy.
- If the hosted site is down or unreachable, you can still self-host using the Quick Start instructions above.
 - If the hosted site is down or unreachable, you can still self-host using the Quick Start instructions above.

## Play on your Local Network (LAN)

If you're running the game with Docker on a machine and want other people on the same local network to join, follow these steps.

1. Ensure the service that serves the client (Nginx or the client dev server) is published to a host port in your Docker Compose file. If no ports are published, other devices cannot reach the service. Example snippet to expose HTTP/HTTPS in `docker-compose.dev.yml`:

```yaml
services:
  nginx:
    # ...other settings...
    ports:
      - "80:80"    # HTTP
      - "443:443"  # HTTPS (optional)

  # or expose the dev client directly (example for Vite)
  client:
    # ...
    ports:
      - "5173:5173"

```

2. Restart the compose stack so the new port mappings take effect:

```bash
npm run dev
```

3. Find the host machine's local IP address (on macOS):

```bash
# Wi-Fi
ipconfig getifaddr en0
# Ethernet (if applicable)
ipconfig getifaddr en1
# Or a generic fallback
ifconfig | grep "inet "

```

4. From any device on the same LAN open a browser to the host IP and port. For example, if you mapped HTTP to port 80 you can visit:

```
http://<HOST_IP>
```

If you published a non-standard port (for example 5173), include it: `http://<HOST_IP>:5173`.

5. Troubleshooting tips

- Confirm Docker is running and the compose stack shows the mapped ports: `docker compose -f docker-compose.dev.yml ps`.
- Check service logs with `docker compose -f docker-compose.dev.yml logs -f`.
- On macOS, ensure the system firewall allows incoming connections for Docker Desktop.
- If you used the local dev server (Vite) without Docker, run it with `npm run dev -- --host` so it listens on the network (not only localhost).

## Play across the Internet (Port forwarding)

To allow players on the internet to connect to a host machine on your network you need to configure your router to forward incoming traffic to that machine.

1. Decide which external port to use (common choices: 80 for HTTP, 443 for HTTPS, or a custom port). If you use 80/443 you may avoid requiring a port in the URL.
2. In your router admin UI, find the Port Forwarding / Virtual Server section and create a rule that forwards the chosen external port (TCP) to the host machine's local IP and the corresponding internal port (for example 80 -> 192.168.1.42:80).
3. Confirm your public IP address (from the host):

```bash
curl ifconfig.me
```

4. Give players the URL `http://<PUBLIC_IP>` (or `https://<PUBLIC_IP>` if you have TLS). If you used a custom port, include it: `http://<PUBLIC_IP>:<PORT>`.

5. Security & reliability notes

- Exposing a local host to the public internet carries security risk. Prefer using HTTPS, keep software up-to-date, and monitor logs.
- If your ISP provides a dynamic public IP, consider a dynamic DNS service (DuckDNS, No-IP) so players can use a hostname.
- As an easier (and often safer) alternative, consider a tunnel service like ngrok or Cloudflare Tunnel. Example using ngrok:

```bash
# requires ngrok installed and an account for long-lived tunnels
ngrok http 80
```

This provides a public URL that forwards to your local service without router changes.
## Create or Join a Game

1. Open the landing page in your browser.
2. To host a game: click Create Room (or Host). Choose any options presented (room name, number of rounds, player limit) and create the room.
3. To join a game: from the landing page, enter the room code or click the room name in a public lobby list and press Join.
4. Once all players are present, the host clicks Start to begin.

Gameplay flow (simple):

- Each round players are asked to scribble, line, color, or name a creature.
- After each round, images rotate to the next player so everyone contributes to each final creature.
- At the end, players will be asked to present and then vote on the creature they end up with.

## Controls and UI (high-level)

- Canvas/drawing tools: usually visible when a round asks you to draw. Tools may include pen, eraser, colors, and a submit button.
- Chat / Lobby: text chat and player lists are visible in the lobby or during the game.
- Host controls: only the host can start and reset games or change room settings.

If a control is not visible, try resizing the window or checking for a mobile-specific menu.

## Common Tasks

- Change display name: open the profile or settings area on the landing page and update your name.
- Reconnect after disconnect: refresh the page. If the server is still running and your room still exists, you will usually rejoin automatically.

## Troubleshooting

- Can't connect / Websocket errors
  - Ensure the server is running (check Docker logs or the server terminal).
  - If running locally without Docker, verify you started the server (see `server/` README).
  - Check firewall or VPN settings that may block local ports.

- Blank screen or build errors in the client
  - Open the browser dev tools console and look for errors. They often point to missing assets or a misconfigured backend URL.
  - If you used Docker Compose, inspect the compose logs: `docker-compose logs -f`.

- Unexpected behavior or crashes
  - Try a browser refresh. If the problem persists, check the server logs and open an issue in the repository with steps to reproduce.

## FAQ (short)

- Q: Does Scribble Beasts work on mobile?
  - A: Yes. The UI is mobile-friendly, but drawing accuracy depends on the device.

- Q: I don't see the room list — what now?
  - A: The room list is populated by active games. If none exist, create a room or check server connectivity.

- Q: Can I host a private game?
  - A: Yes — create a room and do not share the code publicly. The host can control who joins.

For more answers see the full FAQ: `FAQ.md` and the User Manual for configuration options.
