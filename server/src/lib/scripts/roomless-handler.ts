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
import { getHostRoomSettings } from '../components/HostRoomSettings.js';
import { DEFAULT_ROOM_SETTINGS, type RoomSettings } from '../../../../shared/settings/index.js';
import {
  normalizePlayerName,
  normalizeRoomName,
} from '../../../../shared/inputValidation.js';

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

      case ActionEnum.RECONNECT:
        // Reconnect was already attempted at connection time via cookie/query param.
        // If we're here, the player wasn't found — silently ignore.
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
  let playerId: string | undefined;

  // Read playerId from query param (set by sessionStorage on the client)
  if (req.url) {
    const match = req.url.match(/[?&]playerId=([^&]+)/);
    if (match) {
      playerId = match[1];
    }
  }

  if (playerId) {
    const result = findGlobalPlayer(playerId);
    if (result) {
      const { player, room } = result;
      player.reconnect(ws, room);
      // Re-attach the close listener that was wiped by removeAllListeners() in reconnect()
      player.addEventListener('close', () => {
        room.deactivatePlayer(player.name);
      });
      if (player.isHost) {
        room.reattachHostCloseListener();
      }
      console.log(`Player ${player.name} reconnected.`);
      return;
    }
  }

  console.log('New WebSocket connection');
  handleRoomless(ws);
}

function createRoom(action: CreateRoomAction, ws: WebSocket) {
  const normalizedRoomName = normalizeRoomName(action.payload.roomName);
  const normalizedHostName = normalizePlayerName(action.payload.hostName);
  const { settings } = action.payload;

  let { roomInputMessage, nameInputMessage } = checkIfParamsAreEmpty(
    normalizedRoomName,
    normalizedHostName,
  );

  if (roomInputMessage && nameInputMessage) {
    ws.send(
      JSON.stringify(new Actions.RoomError(nameInputMessage, roomInputMessage)),
    );
    return;
  }

  if (findRoom(normalizedRoomName)) {
    ws.send(
      JSON.stringify(
        new Actions.RoomError(nameInputMessage, 'Room name already taken.'),
      ),
    );
    return;
  }

  const host = new Host(normalizedHostName, ws);
  const settingsFromHostHistory = getHostRoomSettings(normalizedHostName);
  const initialSettings = normalizeRoomSettings(
    settings ?? settingsFromHostHistory,
  );
  const newRoom = new Room(normalizedRoomName, host, initialSettings);
  Rooms[normalizedRoomName] = newRoom;
  ws.send(JSON.stringify(new Actions.CreateRoom(normalizedRoomName, normalizedHostName)));
  ws.send(JSON.stringify(new Actions.Reconnect(host.id)));
  console.log(`Room ${normalizedRoomName} created with host ${normalizedHostName}`);
}

function normalizeRoomSettings(settings?: RoomSettings): RoomSettings {
  const defaults: RoomSettings = { ...DEFAULT_ROOM_SETTINGS, roundTimers: {} };
  if (!settings) return defaults;
  return {
    allowSelfVote: !!settings.allowSelfVote,
    skipIntro: !!settings.skipIntro,
    skipTutorials: !!settings.skipTutorials,
    soundMode:
      settings.soundMode === 'shared' || settings.soundMode === 'none'
        ? settings.soundMode
        : 'separate',
    captions: !!settings.captions,
    roundTimers: {
      ...defaults.roundTimers,
      ...(settings.roundTimers ?? {}),
    },
  };
}

function joinRoom(action: JoinRoomAction, ws: WebSocket) {
  const normalizedRoomName = normalizeRoomName(action.payload.roomName);
  const normalizedPlayerName = normalizePlayerName(action.payload.playerName);

  let { roomInputMessage, nameInputMessage } = checkIfParamsAreEmpty(
    normalizedRoomName,
    normalizedPlayerName,
  );

  if (roomInputMessage && nameInputMessage) {
    ws.send(
      JSON.stringify(new Actions.RoomError(nameInputMessage, roomInputMessage)),
    );
    return;
  }

  const room = findRoom(normalizedRoomName);
  if (!room) {
    roomInputMessage = 'Room does not exist.';
  }

  if (room && playerExistsInRoom(room, normalizedPlayerName)) {
    nameInputMessage = 'Name already taken in this room.';
  }

  if (!room || nameInputMessage || roomInputMessage) {
    ws.send(
      JSON.stringify(new Actions.RoomError(nameInputMessage, roomInputMessage)),
    );
    return;
  }

  const player = new Player(normalizedPlayerName, ws);
  room.addPlayer(player);
  ws.send(
    JSON.stringify(
      new Actions.JoinRoom(normalizedRoomName, normalizedPlayerName, room.host.name),
    ),
  );
  ws.send(JSON.stringify(new Actions.Reconnect(player.id)));
  console.log(`Player ${normalizedPlayerName} joined room ${normalizedRoomName}`);
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
