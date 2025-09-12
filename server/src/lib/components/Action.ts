export const enum ActionType {
    CREATE_ROOM = 'CREATE_ROOM',
    JOIN_ROOM = 'JOIN_ROOM',
    ROOM_ERROR = 'ROOM_ERROR',
}

export class Action {
    type: ActionType;
    payload: any;

    constructor(type: ActionType, payload: any) {
        this.type = type;
        this.payload = payload;
    }
}

class CreateRoomAction extends Action {
    constructor(roomName: string, hostName: string) {
        super(ActionType.CREATE_ROOM, { roomName, hostName });
    }
}

class JoinRoomAction extends Action {
    constructor(roomName: string, playerName: string) {
        super(ActionType.JOIN_ROOM, { roomName, playerName });
    }
}

class RoomErrorAction extends Action {
    constructor(nameInputMessage?: string, roomInputMessage?: string) {
        super(ActionType.ROOM_ERROR, { nameInputMessage, roomInputMessage });
    }
}

const Actions = {
    CreateRoom: CreateRoomAction,
    JoinRoom: JoinRoomAction,
    RoomError: RoomErrorAction,
};

export default Actions;