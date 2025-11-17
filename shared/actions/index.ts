/* 
------------------------
HOW TO ADD A NEW ACTION:
------------------------
1. Add a new entry to the ActionEnum enum.
2. Create a class extending Action<{ your payload properties }>
3. Add the new action class to the AnyAction union type.
4. Update the Actions object with the new action class.
*/

export const enum ActionEnum {
  /* Room Actions */
  CREATE_ROOM = 'CREATE_ROOM',
  JOIN_ROOM = 'JOIN_ROOM',
  ROOM_ERROR = 'ROOM_ERROR',
  /* Lobby Actions */
  HOST_CHANGE = 'HOST_CHANGE',
  PLAYER_LIST_CHANGE = 'PLAYER_LIST_CHANGE',
  START_GAME = 'START_GAME',
  /** Round Actions */
  END_ROUND = 'END_ROUND',
  START_ROUND = 'START_ROUND',
  SEND_DRAWING = 'SEND_DRAWING',
  SEND_EOTW = 'EOTW_ROUND',
  PRESENTER_CHANGE = 'PRESENTER_CHANGE',
  PRESENTER_START = 'PRESENTER_START',
  PRESENTER_END = 'PRESENTER_END',
  SEND_VOTE = 'VOTE_ROUND',
}

class Action<Payload> {
  type: ActionEnum;
  payload: Payload;

  constructor(type: ActionEnum, payload: Payload) {
    this.type = type;
    this.payload = payload;
  }
}

export class CreateRoomAction extends Action<{
  roomName: string;
  hostName: string;
}> {
  constructor(roomName: string, hostName: string) {
    super(ActionEnum.CREATE_ROOM, { roomName, hostName });
  }
}

export class JoinRoomAction extends Action<{
  roomName: string;
  playerName: string;
  hostName?: string; // Used only on server reply (because I'm lazy)
}> {
  constructor(roomName: string, playerName: string, hostName?: string) {
    super(ActionEnum.JOIN_ROOM, { roomName, playerName, hostName });
  }
}

export class RoomErrorAction extends Action<{
  nameInputMessage?: string;
  roomInputMessage?: string;
}> {
  constructor(nameInputMessage?: string, roomInputMessage?: string) {
    super(ActionEnum.ROOM_ERROR, { nameInputMessage, roomInputMessage });
  }
}

export class HostChangeAction extends Action<{ newHostName: string }> {
  constructor(newHostName: string) {
    super(ActionEnum.HOST_CHANGE, { newHostName });
  }
}

export class StartGameAction extends Action<{}> {
  constructor() {
    super(ActionEnum.START_GAME, {});
  }
}

export class PlayerListChangeAction extends Action<{ playerList: string[] }> {
  constructor(playerList: string[]) {
    super(ActionEnum.PLAYER_LIST_CHANGE, { playerList });
  }
}

// Round Actions
export class EndRoundAction extends Action<{}> {
  constructor() {
    super(ActionEnum.END_ROUND, {});
  }
}
export class StartRoundAction extends Action<{}> {
  constructor() {
    super(ActionEnum.START_ROUND, {});
  }
}
export class SendDrawingAction extends Action<{ image: Base64URLString }> {
  constructor(image: Base64URLString) {
    super(ActionEnum.SEND_DRAWING, { image });
  }
}
// TODO: make etow a custom card object with art and desc info
// update the payload type accordingly
export class SendEOTWAction extends Action<{ eotw: string }> {
  constructor(eotw: string) {
    super(ActionEnum.SEND_EOTW, { eotw });
  }
}
export class SendPresenterChangeAction extends Action<{
  newPresenter: string;
}> {
  constructor(newPresenter: string) {
    super(ActionEnum.PRESENTER_CHANGE, { newPresenter });
  }
}
export class SendPresenterStartAction extends Action<{}> {
  constructor() {
    super(ActionEnum.PRESENTER_START, {});
  }
}
export class SendPresenterEndAction extends Action<{}> {
  constructor() {
    super(ActionEnum.PRESENTER_END, {});
  }
}
export class SendVoteAction extends Action<{
  first: string; // player who had the best
  second?: string; // second best (might only be 2 players)
  third?: string; // third best (might only be 3 players)
}> {
  constructor(first: string, second: string, third: string) {
    super(ActionEnum.SEND_VOTE, { first, second, third });
  }
}

export type AnyRoundAction =
  | EndRoundAction
  | StartRoundAction
  | SendDrawingAction
  | SendEOTWAction
  | SendVoteAction;

// Type for any action
export type AnyAction =
  | CreateRoomAction
  | JoinRoomAction
  | RoomErrorAction
  | HostChangeAction
  | StartGameAction
  | PlayerListChangeAction
  | AnyRoundAction;

// Actions object for easy import and readability
export const Actions = {
  CreateRoom: CreateRoomAction,
  JoinRoom: JoinRoomAction,
  RoomError: RoomErrorAction,
  HostChange: HostChangeAction,
  StartGame: StartGameAction,
  PlayerListChange: PlayerListChangeAction,
  EndRound: EndRoundAction,
  StartRound: StartRoundAction,
  SendDrawing: SendDrawingAction,
  SendETOW: SendEOTWAction,
  SendVote: SendVoteAction,
};

export class ActionTarget<WebSocket, Event> {
  #ws: WebSocket;
  #actionListeners: Record<
    ActionEnum,
    ((this: WebSocket, ev: Event) => void)[]
  > = {};

  constructor(ws: WebSocket) {
    this.#ws = ws;
  }

  addEventListener(
    type: string,
    listener: (this: WebSocket, ev: Event) => void
  ): void {
    this.#ws.addEventListener(type, listener);
  }

  removeEventListener(
    type: string,
    listener: (this: WebSocket, ev: Event) => void
  ): void {
    this.#ws.removeEventListener(type, listener);
  }

  addActionListener<T extends AnyAction>(
    actionType: ActionEnum,
    listener: (action: T) => void
  ) {
    const actionListener = (ev: Event) => {
      const action = ParseAction<T>(ev.data, actionType);
      if (!action) return;
      listener(action);
    };
    this.addEventListener('message', actionListener);
    if (!this.#actionListeners[actionType]) {
      this.#actionListeners[actionType] = [];
    }
    this.#actionListeners[actionType].push(actionListener);
  }

  removeActionListener(actionType: ActionEnum) {
    if (!this.#actionListeners[actionType]) return;
    this.#actionListeners[actionType].forEach((listener) => {
      this.removeEventListener('message', listener);
    });
  }

  #websocketOpen = 1;
  sendAction(action: object): void {
    const msg = JSON.stringify(action);
    if (this.#ws.readyState === this.#websocketOpen) {
      console.log('sent:', msg);
      this.#ws.send(msg);
    } else {
      console.error('WebSocket is not open. Ready state:', this.#ws.readyState);
    }
  }

  destroy() {
    this.#ws.close();
    this.#ws.removeAllListeners();
  }
}

export function ParseAction<T extends AnyAction>(
  data: string,
  desiredType?: ActionEnum
): T | null {
  try {
    // check that data has the structure of an Action
    const parsedAction = JSON.parse(data) as T;
    if (
      !parsedAction || // null, undefined, etc.
      typeof parsedAction !== 'object' || // not an object
      typeof parsedAction.type !== 'string' || // missing or invalid value for type
      !('payload' in parsedAction) // missing payload (can be any type)
    ) {
      console.error('Received non-action: ', parsedAction);
      return null;
    }
    if (desiredType && parsedAction.type != desiredType) {
      return null;
    }
    return parsedAction;
  } catch (e) {
    console.error('Received non-JSON: ', data);
    return null;
  }
}
