import WebSocket from "ws";

export class Player {
    name: string;
    ws: WebSocket;

    constructor(name: string, ws: WebSocket) {
        ws.removeAllListeners(); // Player class will handle WebSocket events now
        this.name = name;
        this.ws = ws;
    }

    destroy() {
        this.ws.close();
        this.ws.removeAllListeners();
    }
}

export class Host extends Player {
    constructor(name: string, ws: WebSocket) {
        super(name, ws);
    }
}