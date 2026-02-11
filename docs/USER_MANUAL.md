# Scribble Beasts — User Manual

This manual provides a more thorough reference for users and operators who want to understand configuration options, common settings, and behavior details.

## Purpose and scope

The manual is intended for:

- Players who want a detailed reference to UI elements and controls.
- Organizers or hosts who want to run playtests or moderate games.
- Operators who need to configure or deploy the application (high level).

This is not a developer guide — for developer-focused docs see code comments and server README files.

## Deployment and running (operator notes)

- Recommended: use Docker Compose files at the project root for reproducible environments. See `docker-compose.dev.yml` for development playtests.
- Check port mappings in the Compose file(s). If you need to change ports, update the compose file and any Nginx templates under `nginx/`.
- Static client build: the `client/` folder contains the Svelte app; a production build will produce static assets in the usual location for your web server.

### Hosted instance

There is a publicly hosted instance available at `https://scribble-beasts.com` for players who don't want to self-host. Use the hosted site to run casual play sessions or public playtests. Note:

- The hosted instance abstracts away deployment and is useful for non-technical players.
- If you require private hosting or additional data controls for playtests, self-host using the Docker Compose instructions above.
- For issues with the hosted site, open an issue on the repository or contact the maintainers; include steps to reproduce and any observed errors.

### Exposing a host to LAN or the internet

If you need other people on your local network or on the internet to connect to a self-hosted instance, follow these operator-level notes.

- Bind services to host ports: ensure the web-facing service (Nginx or client dev server) is published to the host with Docker Compose `ports:` mappings (for example `80:80` or `5173:5173`).
- For development servers like Vite, run with a host flag so it listens on the network: `npm run dev -- --host`.
- LAN access: after exposing ports, find the host's local IP (e.g., `ipconfig getifaddr en0` on macOS) and test from another device: `http://<HOST_IP>` or `http://<HOST_IP>:<PORT>`.
- Internet access: configure port forwarding on your router to forward the chosen external port to the host's local IP and port. Use dynamic DNS if the public IP is not static.
- Alternative: use a tunnel service (ngrok, Cloudflare Tunnel) to avoid router changes and easily provide a temporary public URL.

Security recommendations for public exposure

- Use HTTPS in production. If using a public-facing endpoint, obtain and configure TLS certificates (Let's Encrypt or a managed provider).
- Keep the server and container images up-to-date and monitor logs for suspicious activity.
- Limit exposure to only required ports and consider firewall rules to restrict unwanted traffic.
## Room settings and behavior

- Room name: free-text label used to identify the room.
- Player limit: optional maximum number of players; once reached new joins are rejected.
- Rounds and timing: host-configurable. If the host chooses a short round time, players will see warnings when time is low.

Server-side behavior

- Websockets are used for real-time synchronization. This enables low-latency updates of drawing actions, room joins, and votes.
- The server keeps room state in memory; if the server process restarts, rooms may be lost unless persistence is added.

Data and privacy

- No personal data is required to play beyond an optional display name. If playtests collect additional information, it will be documented where applicable.

Keyboard shortcuts and UI patterns

- Drawing tools: typically respond to standard pointer events. On desktop, press-and-drag to draw. On mobile, use touch.
- Undo/Redo: if present, use the button icons in the drawing toolbar. (Not all rounds may permit undo.)

Advanced troubleshooting

- If players cannot see other players' drawings: confirm the server's websocket endpoint is reachable and that there are no reverse-proxy misconfigurations.
- If images fail to rotate between players: confirm server log for errors during round transition and open an issue with the server trace.

Logging and support

- For local debugging, watch the server console or `docker-compose logs -f`.
- When opening issues, include: steps to reproduce, expected vs actual behavior, browser & version, server logs (if available), and any console errors.

Maintenance and future improvements (notes for maintainers)

- Add persistence for room state to survive server restarts.
- Provide screenshot-based tutorials and sample rooms for onboarding new players.
