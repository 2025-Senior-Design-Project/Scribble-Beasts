import { AnyAction } from '@shared/actions';
import WebSocket from 'ws';

export class Player {
  name: string;
  ws: WebSocket;
  isHost: boolean = false;

  constructor(name: string, ws: WebSocket) {
    ws.removeAllListeners(); // Player class will handle WebSocket events now
    this.name = name;
    this.ws = ws;
  }

  addEventListener(event: string, listener: (...args: any[]) => void) {
    this.ws.on(event, listener);
  }

  sendAction(action: AnyAction) {
    this.ws.send(JSON.stringify(action));
  }

  destroy() {
    this.ws.close();
    this.ws.removeAllListeners();
  }
}

export class Host extends Player {
  isHost: boolean = true;

  constructor(name: string, ws: WebSocket) {
    super(name, ws);
  }
}
