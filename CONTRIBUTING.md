# Contributing / Development Setup

## Prerequisites

### Required VS Code Extensions

For the best development experience, install the following VS Code extensions:

1. **ESLint** (`dbaeumer.vscode-eslint`)

   - Provides real-time linting and error checking
   - Ensures code quality and consistency

2. **Prettier** (`esbenp.prettier-vscode`)

   - Formats code on save
   - Maintains consistent code style across the project

3. **Svelte for VS Code** (`svelte.svelte-vscode`)

   - Provides syntax highlighting and IntelliSense for Svelte
   - Includes TypeScript support for Svelte files

4. **Docker** (`ms-azuretools.vscode-docker`)
   - Provides Docker commands and container management
   - Syntax highlighting for Docker files

### Install Docker

1. Download and install Docker Desktop from [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
2. Start Docker Desktop
3. Verify installation by running:
   ```bash
   docker --version
   ```

### Install Node.js and npm

1. Download and install Node.js from [https://nodejs.org/](https://nodejs.org/) (This will also install npm)
2. Verify installation by running:
   ```bash
   node --version
   npm --version
   ```

## Project Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/Jasmine-Mogadam/CS5001-Scribble-Beasts.git
   cd CS5001-Scribble-Beasts
   ```

2. Install all dependencies (client and server):

   ```bash
   npm setup
   ```

   This will install dependencies for both the client and server automatically using the workspace configuration.

3. Copy .env.example and rename it to .env

Sometimes you'll get port collisions when trying to run the docker container, just change these port numbers until it doesn't conflict with any ports in use.

## Configuration

### Port Configuration

Duplicate `.env.sample` as `.env` and modify the ports to your heart's content. If you change the nginx port, links to the frontend and backend will change accordingly.

## Running the Project

1. Start all services using Docker Compose:

   ```bash
   npm run dev
   ```

2. Access the application:
   (if you've changed the port nginx runs on, you'll need to append the port number to localhost)

   - Frontend: http://localhost
   - Backend API: http://localhost/api

3. To stop the services:

   ```bash
   docker-compose down
   ```

4.

## Development

- The client and server directories are mounted as volumes, so changes will be reflected immediately without rebuilding the containers
- Use `docker-compose up --build` when you modify the Dockerfile or add new dependencies
- Check container logs using `docker-compose logs -f [service_name]`

# Production

For playtests, we will use the production build and share it via the Release Share docker desktop plugin.

To generate the production build, run:

```bash
npm run down
npm run prod
```
