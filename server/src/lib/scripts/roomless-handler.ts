import WebSocket from 'ws';
import { Room, Rooms } from '../components/Room';
import {
  Actions,
  ActionEnum,
  CreateRoomAction,
  JoinRoomAction,
  ParseAction,
  type AnyAction,
} from '@shared/actions';
import { Player, Host } from '../components/Player';

export function handleNewConnection(ws: WebSocket) {
  console.log('New WebSocket connection');

  ws.on('error', console.error);

  ws.on('message', function message(data) {
    const action = ParseAction<AnyAction>(data.toString());
    if (!action) return;

    switch (action.type) {
      case ActionEnum.CREATE_ROOM:
        createRoom(action, ws);
        break;

      case ActionEnum.JOIN_ROOM:
        joinRoom(action, ws);
        break;

      default:
        console.warn(
          'Unexpected action type while user is not in room: ',
          action.type
        );
        break;
    }
  });
}

function createRoom(action: CreateRoomAction, ws: WebSocket) {
  const { roomName, hostName } = action.payload;
  let { roomInputMessage, nameInputMessage } = checkIfParamsAreEmpty(
    roomName,
    hostName
  );

  if (roomInputMessage && nameInputMessage) {
    ws.send(
      JSON.stringify(new Actions.RoomError(nameInputMessage, roomInputMessage))
    );
    return;
  }

  if (findRoom(roomName)) {
    ws.send(
      JSON.stringify(
        new Actions.RoomError(nameInputMessage, 'Room name already taken.')
      )
    );
    return;
  }

  const newRoom = new Room(roomName, new Host(hostName, ws));
  Rooms[roomName] = newRoom;
  ws.send(JSON.stringify(new Actions.CreateRoom(roomName, hostName)));
  console.log(`Room ${roomName} created with host ${hostName}`);
}

function joinRoom(action: JoinRoomAction, ws: WebSocket) {
  const { roomName, playerName } = action.payload;
  let { roomInputMessage, nameInputMessage } = checkIfParamsAreEmpty(
    roomName,
    playerName
  );

  if (roomInputMessage && nameInputMessage) {
    ws.send(
      JSON.stringify(new Actions.RoomError(nameInputMessage, roomInputMessage))
    );
    return;
  }

  const room = findRoom(roomName);
  if (!room) {
    roomInputMessage = 'Room does not exist.';
  }

  if (room && playerExistsInRoom(room, playerName)) {
    nameInputMessage = 'Name already taken in this room.';
  }

  if (!room || nameInputMessage || roomInputMessage) {
    ws.send(
      JSON.stringify(new Actions.RoomError(nameInputMessage, roomInputMessage))
    );
    return;
  }

  room.addPlayer(new Player(playerName, ws));
  ws.send(
    JSON.stringify(new Actions.JoinRoom(roomName, playerName, room.host.name))
  );
  console.log(`Player ${playerName} joined room ${roomName}`);
}

function checkIfParamsAreEmpty(
  roomName: string,
  playerName: string
): { roomInputMessage?: string; nameInputMessage?: string } {
  let nameInputMessage: string | undefined;
  let roomInputMessage: string | undefined;

  if (!playerName?.trim()) {
    nameInputMessage = 'Name cannot be empty.';
  }
  if (!roomName?.trim()) {
    roomInputMessage = 'Room name cannot be empty.';
  }

  return { roomInputMessage, nameInputMessage };
}

function findRoom(roomName: string): Room | undefined {
  return Rooms[roomName];
}

function playerExistsInRoom(room: Room, playerName: string): boolean {
  return room.players[playerName] !== undefined;
}
