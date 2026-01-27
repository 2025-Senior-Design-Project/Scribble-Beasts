import {
  ActionTarget,
  ActionEnum,
  Actions,
} from '../../../../shared/actions/index.js';
import WebSocket, { MessageEvent } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { Room } from './Room.js';

// base64 encoded url for a blank pixel
export const BLANK_PIXEL =
  'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';

const DISCONNECT_TIMEOUT = 3 * 60 * 1000; // 3 minutes

export class Player extends ActionTarget<WebSocket, MessageEvent> {
  id: string;
  name: string;
  #ws: WebSocket;
  isHost: boolean = false;
  disconnected: boolean = false;
  disconnectTimeout: ReturnType<typeof setTimeout> | undefined;
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

  getWebSocket(): WebSocket {
    return this.#ws;
  }

  handleDisconnect(callback: () => void) {
    this.disconnected = true;
    if (this.disconnectTimeout) {
      clearTimeout(this.disconnectTimeout);
    }
    this.disconnectTimeout = setTimeout(() => {
      if (this.disconnected) {
        callback();
      }
    }, DISCONNECT_TIMEOUT);
  }

  reconnect(ws: WebSocket, room: Room) {
    // clean up old websocket listeners to avoid race conditions
    this.getWebSocket().removeAllListeners();
    this.getWebSocket().close();

    // clear disconnect timeout if it exists
    if (this.disconnectTimeout) {
      clearTimeout(this.disconnectTimeout);
      this.disconnectTimeout = undefined;
    }

    this.disconnected = false;
    this.setWebsocket(ws);

    if (room.game) {
      this.sendAction(
        new Actions.StartGame(
          room.game.currentRoundNumber,
          room.game.getRemainingTime(),
        ),
      );
      this.sendAction(
        new Actions.SendDrawing(room.game.playerDrawings[this.id]),
      );
    } else {
      this.sendAction(
        new Actions.JoinRoom(room.name, this.name, room.host.name),
      );
    }

    room.playerListChanged();
    this.sendAction(new Actions.HostChange(room.host.name));
  }
}

export class Host extends Player {
  isHost: boolean = true;
}
