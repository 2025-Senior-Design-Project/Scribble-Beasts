import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Room } from '../lib/components/Room';
import { Player, Host } from '../lib/components/Player';
import WebSocket from 'ws';

// Mock WebSocket
vi.mock('ws', () => {
  return {
    default: class MockWebSocket {
      listeners: Record<string, Function[]> = {};
      readyState = 1;

      on(event: string, cb: Function) {
        this.addEventListener(event, cb);
      }

      addEventListener(event: string, cb: Function) {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(cb);
      }

      removeEventListener(event: string, cb: Function) {
        if (!this.listeners[event]) return;
        this.listeners[event] = this.listeners[event].filter((l) => l !== cb);
      }

      emit(event: string, ...args: any[]) {
        if (this.listeners[event]) {
          this.listeners[event].forEach((cb) => cb(...args));
        }
      }

      send = vi.fn();
      removeAllListeners = vi.fn();
      close = vi.fn();
    },
  };
});

// Mock Game to prevent complex dependency issues
const mockStartGame = vi.fn();
vi.mock('../lib/components/Game', () => {
  return {
    Game: class MockGame {
      startGame = mockStartGame;
      constructor() {}
    },
  };
});

describe('Room Unit Tests', () => {
  let ws1: any;
  let ws2: any;
  let host: Host;
  let room: Room;

  beforeEach(() => {
    ws1 = new WebSocket('ws://localhost') as any;
    ws2 = new WebSocket('ws://localhost') as any;
    host = new Host('HostUser', ws1);
    room = new Room('TestRoom', host);
    mockStartGame.mockClear();
  });

  describe('TC-01: Create Room', () => {
    it('initializes a room with a host and correct name', () => {
      expect(room.name).toBe('TestRoom');
      expect(room.host.name).toBe('HostUser');
      expect(room.host.isHost).toBe(true);
      expect(room.players['HostUser']).toBe(host);
    });
  });

  describe('TC-02: Join Room', () => {
    it('allows a player to join the room', () => {
      const player2 = new Player('Player2', ws2);
      room.addPlayer(player2);

      expect(room.players['Player2']).toBe(player2);
      expect(room.players['Player2'].name).toBe('Player2');
      expect(room.getConnectedPlayers().length).toBe(2);
    });
  });

  describe('TC-04: Host Reassignment on Disconnect', () => {
    it('transfers host privileges to another player if the host disconnects', () => {
      // Setup initial state
      const player2 = new Player('Player2', ws2);
      room.addPlayer(player2);

      // Initial State Check
      expect(room.host.name).toBe('HostUser');
      expect(host.isHost).toBe(true);
      expect(room.players['Player2']).toBe(player2);

      // Simulate Host disconnect
      ws1.emit('close');

      // Verify Host Reassignment
      expect(room.host.name).toBe('Player2');
      expect(player2.isHost).toBe(true);
    });
  });

  describe('TC-15: Minimum Players', () => {
    it('does not start the game if fewer than 2 players are connected', () => {
      // Only host is connected
      room.startGame();

      // Game should not be created or started
      expect(room.game).toBeNull();
      expect(mockStartGame).not.toHaveBeenCalled();
    });

    it('starts the game if at least 2 players are connected', () => {
      const player2 = new Player('Player2', ws2);
      room.addPlayer(player2);

      room.startGame();

      expect(room.game).not.toBeNull();
      // Since we mocked Game, we check if startGame was called on the mock instance
      // But we can't easily access the instance unless we captured it.
      // However, we set mockStartGame as the method of the class.
      expect(mockStartGame).toHaveBeenCalled();
    });
  });

  describe('TC-18: Special Characters', () => {
    it('handles special characters in room and player names', () => {
      const specialName = 'User!@#$%^&*()';
      const specialRoomName = 'Room!@#$%^&*()';

      const wsSpecial = new WebSocket('ws://localhost') as any;
      const specialHost = new Host(specialName, wsSpecial);
      const specialRoom = new Room(specialRoomName, specialHost);

      expect(specialRoom.name).toBe(specialRoomName);
      expect(specialRoom.host.name).toBe(specialName);
      expect(specialRoom.players[specialName]).toBe(specialHost);
    });
  });
});
