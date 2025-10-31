import { ActionTarget, ActionEnum } from '@shared/actions';
import WebSocket from 'ws';

// base64 encoded url for a blank pixel
export const BLANK_PIXEL =
  'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';

export class Player extends ActionTarget<WebSocket, any[]> {
  name: string;
  #ws: WebSocket;
  isHost: boolean = false;
  lastUploadedImage: string; // base64encoded url

  constructor(name: string, ws: WebSocket) {
    super(ws);
    this.#ws = ws;
    this.name = name;
    this.lastUploadedImage = BLANK_PIXEL;

    // remove inital roomless listeners
    this.#ws.removeAllListeners('message');
  }
}

export class Host extends Player {
  isHost: boolean = true;
}
