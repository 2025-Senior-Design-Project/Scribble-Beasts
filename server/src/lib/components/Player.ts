import { ActionTarget } from '@shared/actions';
import WebSocket from 'ws';

export class Player extends ActionTarget<WebSocket, any[]> {
  name: string;
  #ws: WebSocket;
  isHost: boolean = false;

  constructor(name: string, ws: WebSocket) {
    super(ws);
    this.#ws = ws;
    this.name = name;
  }
}

export class Host extends Player {
  isHost: boolean = true;

  constructor(name: string, ws: WebSocket) {
    super(name, ws);
  }
}
