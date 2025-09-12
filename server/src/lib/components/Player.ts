import WebSocket from "ws";

class Player {
    name: string;
    ws: WebSocket;

    constructor(name: string, ws: WebSocket) {
        this.name = name;
        this.ws = ws;
    }
}

export default Player;