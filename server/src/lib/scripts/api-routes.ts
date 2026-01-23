import { Request, Response, Router } from 'express';
import { Rooms, Room } from '../components/Room';
import { PendingConnections } from './pending-connections';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.post('/create', (req: Request, res: Response) => {
  const { roomName, hostName } = req.body;
  const { roomInputMessage, nameInputMessage } = checkIfParamsAreEmpty(
    roomName,
    hostName,
  );

  if (roomInputMessage || nameInputMessage) {
    res.status(400).json({
      error: 'Validation Error',
      nameInputMessage,
      roomInputMessage,
    });
    return;
  }

  if (findRoom(roomName) || isRoomPendingCreation(roomName)) {
    res.status(400).json({
      error: 'Room exists',
      roomInputMessage: 'Room name already taken.',
    });
    return;
  }

  // Generate ID and store pending
  const playerId = uuidv4();
  PendingConnections[playerId] = {
    type: 'create',
    roomName,
    name: hostName,
  };

  console.log(
    `Room ${roomName} pending creation with host ${hostName} via API`,
  );

  res.json({
    success: true,
    playerId,
    roomName,
    hostName,
  });
});

router.post('/join', (req: Request, res: Response) => {
  const { roomName, playerName } = req.body;
  let { roomInputMessage, nameInputMessage } = checkIfParamsAreEmpty(
    roomName,
    playerName,
  );

  if (roomInputMessage || nameInputMessage) {
    res.status(400).json({
      error: 'Validation Error',
      nameInputMessage,
      roomInputMessage,
    });
    return;
  }

  const room = findRoom(roomName);
  if (!room) {
    res.status(400).json({
      error: 'Room not found',
      roomInputMessage: 'Room does not exist.',
    });
    return;
  }

  if (playerExistsInRoom(room, playerName)) {
    res.status(400).json({
      error: 'Name taken',
      nameInputMessage: 'Name already taken in this room.',
    });
    return;
  }

  // Generate ID and store pending
  const playerId = uuidv4();
  PendingConnections[playerId] = {
    type: 'join',
    roomName,
    name: playerName,
  };

  console.log(`Player ${playerName} pending join to room ${roomName} via API`);

  res.json({
    success: true,
    playerId,
    roomName,
    hostName: room.host.name,
    playerName,
  });
});

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

function isRoomPendingCreation(roomName: string): boolean {
  return Object.values(PendingConnections).some(
    (pending) => pending.type === 'create' && pending.roomName === roomName,
  );
}

function playerExistsInRoom(room: Room, playerName: string): boolean {
  return !!Object.values(room.players).find((p) => p.name === playerName);
}

export default router;
