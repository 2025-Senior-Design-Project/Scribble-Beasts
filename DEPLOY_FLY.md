# Fly.io Deployment Instructions

This project is configured to be deployed as two separate Fly.io applications: one for the Server (backend) and one for the Client (frontend).

## Prerequisites

1.  **Fly CLI**: Ensure you have the [Fly CLI installed](https://fly.io/docs/hands-on/install-flyctl/).
2.  **Login**: Run `fly auth login` to sign in to your Fly.io account.

## App Creation (Run Once)

You need to create the apps on Fly.io before deploying.

You can create both apps in the "Scribble Beasts" organization using the following npm command:

```bash
npm run create:apps
```

This attempts to create the apps `scribble-server-jazmo` and `scribble-client-jazmo`.

**Note:** App names must be globally unique. If these names are also taken, the command will fail. You will need to:

1.  Choose unique names.
2.  Update `fly.server.toml` and `fly.client.toml`.
3.  Update the `create:apps` script in `package.json` (or run `fly apps create <new-name>` manually for each app).

## Deployment

You can deploy both applications with a single command. You need to provide the server URL so the client knows where to connect.

### Deploy All (Recommended)

Run this command in your terminal:

```bash
VITE_SERVER_URL=https://scribble-server-jazmo.fly.dev npm run deploy
```

### Deploy Individually

**Deploy Server:**

```bash
npm run deploy:server
```

**Deploy Client:**

```bash
npm run deploy:client -- --build-arg VITE_SERVER_URL=https://scribble-server-jazmo.fly.dev
```

## Troubleshooting

- **Context Issues**: Deployment commands are run from the project root. The configurations are set up to use the root directory as the build context, allowing access to `shared/` and `package.json`.
- **Missing URL**: If the client connects to the wrong URL, ensure `VITE_SERVER_URL` was correctly passed during the build.
- **App Name Conflict**: If you cannot create the apps because the names are taken, edit `fly.server.toml` and `fly.client.toml` with unique names.
