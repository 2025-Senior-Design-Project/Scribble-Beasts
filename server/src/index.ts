import express from 'express';
import { WebSocket, WebSocketServer } from 'ws';

const app = express();
if (!process.env.SERVER_PORT) {
    throw new Error("Missing SERVER_PORT in environment variables");
}
const SERVER_PORT = process.env.SERVER_PORT;

// Create HTTP server
const httpServer = app.listen(SERVER_PORT, () => {
    console.log(`Server is running at http://localhost:${SERVER_PORT}/`);
    console.log(`Ngnix is running at http://localhost:${process.env.NGINX_PORT}/`);
});

// Create WebSocket server attached to HTTP server
const wss = new WebSocketServer({ server: httpServer });

wss.on('connection', function connection(ws: WebSocket) {
    console.log('New WebSocket connection');
    ws.on('error', console.error);

    ws.on('message', function message(data) {
        if (data.toString() === 'ping') {
            ws.send('pong')
        }
        else {
            ws.send('Huh???')
        }
    });
});

// Graceful shutdown handler
function shutdownHandler(signal: string) {
    console.log(`Received signal ${signal}. Closing server...`);

    httpServer.close(() => {
        process.exit(0);
    });
}

// Register signals for graceful shutdown
['SIGINT', 'SIGTERM'].forEach(signal => {
    process.on(signal, () => shutdownHandler(signal));
});