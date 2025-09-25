import { Actions, ActionType } from '@shared/actions';
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
    this.hostSetup();
  }

  hostSetup() {
    // If host disconnects, make the next player the host (if any exist)
    this.host.addEventListener('close', () => {
      const playerNames = Object.keys(this.players);
      if (playerNames.length === 0) return; // No players left to become host
      const playerToBecomeHost = this.players[playerNames[0]];
      playerToBecomeHost.isHost = true;
      const newHost = playerToBecomeHost as Host;
      delete this.players[playerToBecomeHost.name]; // don't call the removePlayer function to avoid closing the ws
      this.host = newHost;
      console.log(
        `Host ${this.host.name} disconnected from room ${this.name}. New host is ${newHost.name}`
      );
      this.hostSetup();
      const hostChangeAction = new Actions.HostChange(this.host.name);
      this.host.sendAction(hostChangeAction);
    });
    this.host.addActionListener(ActionType.START_GAME, (action) => {
      this.sendActionToAll(action);
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
    this.playerListChanged();
  }

  removePlayer(playerName: string): void {
    const playerToRemove = this.players[playerName];
    if (playerToRemove) {
      playerToRemove.destroy();
      delete this.players[playerName];
      this.playerListChanged();
    }
    if (Object.keys(this.players).length === 0) {
      console.log(`All players left room ${this.name}, it will be destroyed.`);
      this.destroy();
    }
  }

  hasPlayer(playerName: string): boolean {
    return !!this.players[playerName];
  }

  playerListChanged() {
    this.sendActionToAll(
      new Actions.PlayerListChange(Object.keys(this.players))
    );
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
