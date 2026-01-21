import WebSocket from 'ws';
import { Room, Rooms } from '../components/Room.js';
import { Actions } from '@shared/actions/index.js';
import { Player, Host } from '../components/Player.js';
import { IncomingMessage } from 'http';
import { PendingConnections } from './pending-connections.js';

export function handleRoomless(ws: WebSocket) {
  // This should not happen for authenticated users
  console.warn('Unexpected message on roomless socket. Closing.');
  ws.close();
}

export function handleNewConnection(ws: WebSocket, req: IncomingMessage) {
  const cookies = parseCookies(req.headers.cookie);
  let playerId = cookies.playerId;

  if (!playerId && req.url) {
    const match = req.url.match(/[?&]playerId=([^&]+)/);
    if (match) {
      playerId = match[1];
    }
  }

  if (playerId) {
    // Check pending connections first
    const pending = PendingConnections[playerId];
    if (pending) {
      handlePendingConnection(ws, playerId, pending);
      delete PendingConnections[playerId];
      return;
    }

    // Check existing players (reconnect)
    const result = findGlobalPlayer(playerId);
    if (result) {
      const { player, room } = result;
      player.reconnect(ws, room);
      console.log(`Player ${player.name} reconnected.`);
      return;
    }
  }

  console.log('New WebSocket connection without valid player ID. Closing.');
  ws.close(4001, 'Invalid Session');
}

function handlePendingConnection(
  ws: WebSocket,
  playerId: string,
  pending: { type: 'create' | 'join'; roomName: string; name: string },
) {
  if (pending.type === 'create') {
    if (Rooms[pending.roomName]) {
      // Room already exists (race condition?), fail or reconnect?
      // If room exists, maybe we are reconnecting to it?
      // But type is 'create'.
      // Assume creation always valid if pending.
      console.warn(`Room ${pending.roomName} already exists during creation.`);
      // Proceed to overwrite? Or fail?
      // For now, let's assume overwriting or handling as reconnect is better?
      // But we have 'name' as hostName.
      // Let's create new Room/Host.
    }

    const host = new Host(pending.name, ws, playerId);
    const newRoom = new Room(pending.roomName, host);
    Rooms[pending.roomName] = newRoom;
    console.log(`Room ${pending.roomName} finalized with host ${host.name}`);

    // Notify client
    host.sendAction(new Actions.RoomJoined(newRoom.name, host.name, host.name));
    // Also send Reconnect action (with ID) to confirm ID?
    // Client already has ID.
    // RoomJoined is enough.
  } else if (pending.type === 'join') {
    const room = Rooms[pending.roomName];
    if (!room) {
      console.warn(`Room ${pending.roomName} not found for pending join.`);
      ws.close();
      return;
    }

    const player = new Player(pending.name, ws, playerId);
    room.addPlayer(player);
    console.log(`Player ${player.name} finalized join to ${room.name}`);

    // RoomJoined is sent by Room.addPlayer? No.
    // Room.addPlayer adds listeners.
    // We need to send RoomJoined.
    player.sendAction(
      new Actions.RoomJoined(room.name, player.name, room.host.name),
    );
    // Also send Reconnect?
  }
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
