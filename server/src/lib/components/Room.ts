import { Actions, ActionEnum } from '../../../../shared/actions/index.js';
import { Player, Host } from './Player.js';
import { Game } from './Game.js';
import { handleRoomless } from '../scripts/roomless-handler.js';

export const Rooms: Record<string, Room> = {};

export class Room {
  name: string;
  host: Host;
  players: Record<string, Player> = {};
  game: Game | null = null;

  constructor(name: string, host: Player) {
    this.name = name;
    this.host = host;
    this.addPlayer(host);
    this.hostSetup();
  }

  hostSetup() {
    // If host disconnects, make the next player the host (if any exist)
    this.host.addEventListener('close', () => {
      const connectedPlayers = this.getConnectedPlayers();
      if (connectedPlayers.length === 0) return; // No players left to become host
      const playerToBecomeHost = connectedPlayers[0];
      playerToBecomeHost.isHost = true;
      const newHost = playerToBecomeHost as Host;
      this.host = newHost;
      console.log(
        `Host ${this.host.name} disconnected from room ${this.name}. New host is ${newHost.name}`,
      );
      this.hostSetup();
      const hostChangeAction = new Actions.HostChange(this.host.name);
      this.host.sendAction(hostChangeAction);
    });
    this.host.addActionListener(
      ActionEnum.START_GAME,
      this.startGame.bind(this),
    );
    this.host.addActionListener(ActionEnum.AUDIO_SETTINGS_CHANGE, (action) =>
      this.sendActionToAll(action),
    );
  }

  destroy() {
    Object.values(this.players).forEach((player) => player.destroy());
    this.players = {};
    delete Rooms[this.name];
  }

  addPlayer(player: Player): void {
    this.players[player.name] = player;
    player.addEventListener('close', () => {
      this.disconnectPlayer(player.name);
    });
    player.addActionListener(ActionEnum.LEAVE_ROOM, () => {
      this.removePlayer(player.name, false);
    });
    this.playerListChanged();
  }

  disconnectPlayer(playerName: string): void {
    const player = this.players[playerName];
    if (player) {
      console.log(`Player ${playerName} disconnected from room ${this.name}.`);

      player.handleDisconnect(() => {
        console.log(
          `Player ${playerName} was removed from room ${this.name} because they were disconnected for too long.`,
        );
        this.removePlayer(playerName);
      });

      this.playerListChanged();
    }
  }

  removePlayer(playerName: string, permanently: boolean = true): void {
    const playerToRemove = this.players[playerName];
    if (playerToRemove) {
      if (permanently) {
        playerToRemove.destroy();
      } else {
        handleRoomless(playerToRemove.getWebSocket());
      }
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
      new Actions.PlayerListChange(
        this.getConnectedPlayers().map((p) => p.name),
      ),
    );
  }

  sendActionToPlayer(action: any, player: Player): void {
    if (this.hasPlayer(player.name)) {
      player.sendAction(action);
    }
  }

  sendActionToAll(action: any): void {
    this.getConnectedPlayers().forEach((player) => {
      player.sendAction(action);
    });
  }

  startGame(): void {
    this.sendActionToAll(new Actions.StartGame());
    this.game = new Game(
      Object.values(this.players),
      this.sendActionToAll.bind(this),
      () => {},
    );
    this.game.startGame();
  }

  getConnectedPlayers(): Player[] {
    return Object.values(this.players).filter((p) => !p.disconnected);
  }

  findPlayerById(playerId: string): Player | undefined {
    return Object.values(this.players).find((p) => p.id === playerId);
  }
}
