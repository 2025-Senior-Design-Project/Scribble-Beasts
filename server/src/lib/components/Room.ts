import { Player, Host } from './Player';

export const Rooms: Record<string, Room> = {};

export class Room {
  name: string;
  host: Host;
  players: Record<string, Player> = {};

  constructor(name: string, host: Player) {
    this.name = name;
    this.host = host;
    this.addPlayer(host);
    // If host disconnects, make the next player the host (if any exist)
    host.addEventListener('close', () => {
      const playerNames = Object.keys(this.players);
      if (playerNames.length === 0) return; // No players left to become host
      const playerToBecomeHost = this.players[playerNames[0]];
      const newHost = new Host(playerToBecomeHost.name, playerToBecomeHost.ws);
      delete this.players[playerToBecomeHost.name]; // don't call the removePlayer function to avoid closing the ws
      this.host = newHost;
      console.log(
        `Host ${host.name} disconnected from room ${this.name}. New host is ${newHost.name}`
      );
      this.host.sendAction({ type: 'HOST_YOU_ARE' });
    });
  }

  destroy() {
    Object.values(this.players).forEach((player) => player.destroy());
    this.players = {};
    delete Rooms[this.name];
  }

  addPlayer(player: Player): void {
    this.players[player.name] = player;
    player.addEventListener('close', () => {
      this.removePlayer(player.name);
    });
  }

  removePlayer(playerName: string): void {
    const playerToRemove = this.players[playerName];
    if (playerToRemove) {
      playerToRemove.destroy();
      delete this.players[playerName];
    }
    if (Object.keys(this.players).length === 0) {
      console.log(`All players left room ${this.name}, it will be destroyed.`);
      this.destroy();
    }
  }

  hasPlayer(playerName: string): boolean {
    return !!this.players[playerName];
  }

  sendActionToPlayer(action: any, player: Player): void {
    if (this.hasPlayer(player.name)) {
      player.sendAction(action);
    }
  }

  sendActionToAll(action: any): void {
    Object.values(this.players).forEach((player) => {
      player.sendAction(action);
    });
  }

  startGame(): void {
    this.sendActionToAll({ type: 'GAME_START' });
  }
}
