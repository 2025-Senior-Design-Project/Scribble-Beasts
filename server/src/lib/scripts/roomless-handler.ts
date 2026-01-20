import WebSocket from 'ws';
import { Room, Rooms } from '../components/Room.js';
import {
  Actions,
  ActionEnum,
  CreateRoomAction,
  JoinRoomAction,
  ParseAction,
  type AnyAction,
} from '../../../../shared/actions/index.js';
import { Player, Host } from '../components/Player.js';
import { IncomingMessage } from 'http';

export function handleRoomless(ws: WebSocket) {
  ws.on('error', console.error);

  ws.on('message', function message(data) {
    const action = ParseAction<AnyAction>(data.toString());
    if (!action) return;

    switch (action.type) {
      case ActionEnum.CREATE_ROOM:
        createRoom(action as CreateRoomAction, ws);
        break;

      case ActionEnum.JOIN_ROOM:
        joinRoom(action as JoinRoomAction, ws);
        break;

      default:
        console.warn(
          'Unexpected action type while user is not in room: ',
          action.type,
        );
        break;
    }
  });
}

export function handleNewConnection(ws: WebSocket, req: IncomingMessage) {
  const cookies = parseCookies(req.headers.cookie);
  const playerId = cookies.playerId;

  if (playerId) {
    const result = findGlobalPlayer(playerId);
    if (result) {
      const { player, room } = result;
      player.reconnect(ws, room);
      console.log(`Player ${player.name} reconnected.`);
      // Send a reconnected action to the client
      return;
    }
  }

  console.log('New WebSocket connection');
  handleRoomless(ws);
}

function createRoom(action: CreateRoomAction, ws: WebSocket) {
  const { roomName, hostName } = action.payload;
  let { roomInputMessage, nameInputMessage } = checkIfParamsAreEmpty(
    roomName,
    hostName,
  );

  if (roomInputMessage && nameInputMessage) {
    ws.send(
      JSON.stringify(new Actions.RoomError(nameInputMessage, roomInputMessage)),
    );
    return;
  }

  if (findRoom(roomName)) {
    ws.send(
      JSON.stringify(
        new Actions.RoomError(nameInputMessage, 'Room name already taken.'),
      ),
    );
    return;
  }

  const host = new Host(hostName, ws);
  const newRoom = new Room(roomName, host);
  Rooms[roomName] = newRoom;
  ws.send(JSON.stringify(new Actions.CreateRoom(roomName, hostName)));
  ws.send(JSON.stringify(new Actions.Reconnect(host.id)));
  console.log(`Room ${roomName} created with host ${hostName}`);
}

function joinRoom(action: JoinRoomAction, ws: WebSocket) {
  const { roomName, playerName } = action.payload;
  let { roomInputMessage, nameInputMessage } = checkIfParamsAreEmpty(
    roomName,
    playerName,
  );

  if (roomInputMessage && nameInputMessage) {
    ws.send(
      JSON.stringify(new Actions.RoomError(nameInputMessage, roomInputMessage)),
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
      JSON.stringify(new Actions.RoomError(nameInputMessage, roomInputMessage)),
    );
    return;
  }

  const player = new Player(playerName, ws);
  room.addPlayer(player);
  ws.send(
    JSON.stringify(new Actions.JoinRoom(roomName, playerName, room.host.name)),
  );
  ws.send(JSON.stringify(new Actions.Reconnect(player.id)));
  console.log(`Player ${playerName} joined room ${roomName}`);
}

function checkIfParamsAreEmpty(
  roomName: string,
  playerName: string,
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
  return !!Object.values(room.players).find((p) => p.name === playerName);
}

function parseCookies(cookieHeader?: string): Record<string, string> {
  const list: Record<string, string> = {};
  if (!cookieHeader) return list;

  cookieHeader.split(';').forEach(function (cookie) {
    const parts = cookie.split('=');
    const key = parts.shift()?.trim();
    if (key) {
      list[key] = decodeURI(parts.join('='));
    }
  });

  return list;
}

function findGlobalPlayer(
  playerId: string,
): { player: Player; room: Room } | undefined {
  for (const room of Object.values(Rooms)) {
    const player = room.findPlayerById(playerId);
    if (player) {
      return { player, room };
    }
  }
  return undefined;
}
