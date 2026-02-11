# FAQ — Frequently Asked Questions

Below are short answers to some common questions players and hosts ask.

Q: What browsers are supported?

A: Modern browsers (Chrome, Edge, Firefox, Safari). For the best experience use the latest stable version.

Q: Is there a hosted version of Scribble Beasts?

A: Yes — a hosted instance is available at `https://scribble-beasts.com`. You can play there without hosting the project locally. If you prefer to self-host for privacy or development, follow the Quick Start in `USER_GUIDE.md`.

Q: I can't join a room — what should I check?

A:
- Make sure the server is running (if you're hosting your own instance).
- Ensure your network doesn't block the port used by the application (check `docker-compose.*.yml`).
- If you see a connection error in the browser console, copy the error when reporting an issue.

Q: Do I need an account to play?

A: No. The app uses a display name for players. If you need persistent accounts, this is considered a future enhancement.

Q: Why is my drawing not saved after refresh?

A: Local unsaved canvas state is ephemeral. The game logic expects players to submit drawings during rounds; server-side persistence of intermediate canvases is limited.

Q: Can I run the client and server on different machines?

A: Yes — update the client configuration or environment variables so the client points to the server URL. If you're using Docker Compose across machines, ensure the server is reachable from the client host.

Q: Where do I send bug reports or feature requests?

A: Open an issue on the repository and include as much detail as possible: steps to reproduce, screenshots, browser version, and server logs if available.
