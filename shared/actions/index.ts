/*
    ------------------------
    HOW TO ADD A NEW ACTION:
    ------------------------
    1. Add a new entry to the ActionType enum.
    2. Define a payload type for the action.
    3. Create an interface for the action that includes the type and payload.
    4. Add the new action interface to the AnyAction union type.
    5. Use the ActionClassFactory to create a class for the new action and add it to the Actions object.
*/

export const enum ActionType {
  CREATE_ROOM = 'CREATE_ROOM',
  JOIN_ROOM = 'JOIN_ROOM',
  ROOM_ERROR = 'ROOM_ERROR',
  HOST_CHANGE = 'HOST_CHANGE',
  PLAYER_LIST_CHANGE = 'PLAYER_LIST_CHANGE',
  START_GAME = 'START_GAME',
}

// Action payloads
type CreateRoomPayload = {
  roomName: string;
  hostName: string;
};
const CreateRoomPayloadKeys = ['roomName', 'hostName'];
export interface CreateRoomAction {
  type: ActionType.CREATE_ROOM;
  payload: CreateRoomPayload;
}

type JoinRoomPayload = {
  roomName: string;
  playerName: string;
  hostName?: string; // Used only on server reply (because I'm lazy)
};
const JoinRoomPayloadKeys = ['roomName', 'playerName', 'hostName'];
export interface JoinRoomAction {
  type: ActionType.JOIN_ROOM;
  payload: JoinRoomPayload;
}

type RoomErrorPayload = {
  nameInputMessage?: string;
  roomInputMessage?: string;
};
const RoomErrorPayloadKeys = ['nameInputMessage', 'roomInputMessage'];
export interface RoomErrorAction {
  type: ActionType.ROOM_ERROR;
  payload: RoomErrorPayload;
}

type HostChangePayload = {
  newHostName: string;
};
const HostChangePayloadKeys = ['newHostName'];
export interface HostChangeAction {
  type: ActionType.HOST_CHANGE;
  payload: HostChangePayload;
}

type StartGamePayload = {};
const StartGamePayloadKeys: string[] = [];
export interface StartGameAction {
  type: ActionType.START_GAME;
  payload: StartGamePayload;
}

type PlayerListChangePayload = { playerList: string[] };
const PlayerListChangePayloadKeys = ['playerList'];
export interface PlayerListChangeAction {
  type: ActionType.PLAYER_LIST_CHANGE;
  payload: PlayerListChangePayload;
}

export type AnyAction =
  | CreateRoomAction
  | JoinRoomAction
  | RoomErrorAction
  | HostChangeAction
  | StartGameAction
  | PlayerListChangeAction;

// Actions object for easy import and readability
export const Actions = {
  CreateRoom: ActionClassFactory<CreateRoomPayload>(
    CreateRoomPayloadKeys,
    ActionType.CREATE_ROOM
  ),
  JoinRoom: ActionClassFactory<JoinRoomPayload>(
    JoinRoomPayloadKeys,
    ActionType.JOIN_ROOM
  ),
  RoomError: ActionClassFactory<RoomErrorPayload>(
    RoomErrorPayloadKeys,
    ActionType.ROOM_ERROR
  ),
  HostChange: ActionClassFactory<HostChangePayload>(
    HostChangePayloadKeys,
    ActionType.HOST_CHANGE
  ),
  StartGame: ActionClassFactory<StartGamePayload>(
    StartGamePayloadKeys,
    ActionType.START_GAME
  ),
  PlayerListChange: ActionClassFactory<PlayerListChangePayload>(
    PlayerListChangePayloadKeys,
    ActionType.PLAYER_LIST_CHANGE
  ),
};

// Factory function for creating new action classes
interface Action<T> {
  type: ActionType;
  payload: T;
}
function ActionClassFactory<T extends object>(
  payloadKeys: string[],
  actionType: ActionType
) {
  // Create a new class that implements Action<T>
  const ActionClass = class implements Action<T> {
    type: ActionType;
    payload: T;

    constructor(...args: any[]) {
      // Convert arguments to an object with numbered keys
      // allows new NewAction(arg0, arg1, ...) to map to { arg0: ..., arg1: ... }
      this.payload = args.reduce(
        (acc, arg, index) => ({
          ...acc,
          [payloadKeys[index]]: arg,
        }),
        {}
      ) as unknown as T;
      this.type = actionType;
    }
  };

  // Return the class
  return ActionClass;
}

// Websocket and event are different for node and vite
export class ActionTarget<WebSocket, Event> {
  #ws: WebSocket;
  #actionListeners: Record<
    ActionType,
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
    actionType: ActionType,
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

  /**
   * Removes all listeners on a websocket for a specific actionType
   * @param actionType Action you want to remove ALL listeners for
   */
  removeActionListener(actionType: ActionType) {
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
  desiredType?: ActionType
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
