import { ActionTarget, ActionEnum } from '@shared/actions';
import WebSocket, { MessageEvent } from 'ws';
import { v4 as uuidv4 } from 'uuid';

// base64 encoded url for a blank pixel
export const BLANK_PIXEL =
  'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';

export class Player extends ActionTarget<WebSocket, MessageEvent> {
  id: string;
  name: string;
  #ws: WebSocket;
  isHost: boolean = false;
  disconnected: boolean = false;
  lastUploadedImage: string; // base64encoded url

  constructor(name: string, ws: WebSocket) {
    super(ws);
    this.id = uuidv4();
    this.#ws = ws;
    this.name = name;
    this.lastUploadedImage = BLANK_PIXEL;

    // remove inital roomless listeners
    this.#ws.removeAllListeners('message');
  }

  reconnect(ws: WebSocket) {
    this.disconnected = false;
    this.setWebsocket(ws);
    ws.removeAllListeners('message');
    // ActionTarget's constructor is what sets up the listeners,
    // but we can't call it again.
    // Re-implementing the listener setup here is not ideal,
    // but it's the simplest solution without a major refactor.
    this.addActionListener(ActionEnum.CREATE_ROOM, () => {});
    this.addActionListener(ActionEnum.JOIN_ROOM, () => {});
  }
}

export class Host extends Player {
  isHost: boolean = true;
}
