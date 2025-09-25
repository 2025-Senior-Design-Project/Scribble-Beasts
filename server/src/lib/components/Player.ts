import { ActionTarget, ActionType } from '@shared/actions';
import WebSocket from 'ws';

export class Player extends ActionTarget<WebSocket, any[]> {
  name: string;
  #ws: WebSocket;
  isHost: boolean = false;

  constructor(name: string, ws: WebSocket) {
    super(ws);
    this.#ws = ws;
    this.name = name;

    this.removeActionListener(ActionType.JOIN_ROOM);
    this.removeActionListener(ActionType.CREATE_ROOM);
  }
}

export class Host extends Player {
  isHost: boolean = true;
}
