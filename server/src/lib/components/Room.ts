import { Actions, ActionEnum, type UpdateRoomSettingsAction } from '../../../../shared/actions/index.js';
import { DEFAULT_ROOM_SETTINGS, type RoomSettings } from '../../../../shared/settings/index.js';
import { Player, Host } from './Player.js';
import { Game } from './Game.js';
import { handleRoomless } from '../scripts/roomless-handler.js';

export const Rooms: Record<string, Room> = {};

export class Room {
  name: string;
  host: Host;
  players: Record<string, Player> = {};
  game: Game | null = null;
  settings: RoomSettings = { ...DEFAULT_ROOM_SETTINGS, roundTimers: {} };

  constructor(name: string, host: Player) {
    this.name = name;
    this.host = host;
    this.addPlayer(host);
    this.hostSetup();
  }

  hostSetup() {
    // If host disconnects, make the next player the host (if any exist)
    this.#attachHostCloseListener();
    this.host.addActionListener(
      ActionEnum.START_GAME,
      this.startGame.bind(this),
    );
    this.host.addActionListener<UpdateRoomSettingsAction>(
      ActionEnum.UPDATE_ROOM_SETTINGS,
      this.updateSettings.bind(this),
    );
  }

  #attachHostCloseListener() {
    this.host.addEventListener('close', () => {
      this.ensureConnectedHost();
    });
  }

  reattachHostCloseListener() {
    this.#attachHostCloseListener();
  }

  /** Ensures room.host always points to a currently connected player when one exists. */
  ensureConnectedHost(): void {
    if (!this.host.disconnected) return;

    const connectedPlayers = this.getConnectedPlayers();
    if (connectedPlayers.length === 0) return;

    const oldHostName = this.host.name;
    const playerToBecomeHost = connectedPlayers[0];
    this.host.isHost = false;
    playerToBecomeHost.isHost = true;
    this.host = playerToBecomeHost as Host;
    console.log(
      `Host ${oldHostName} unavailable in room ${this.name}. New host is ${this.host.name}`,
    );
    this.hostSetup();
    this.sendActionToAll(new Actions.HostChange(this.host.name));
  }

  updateSettings(action: UpdateRoomSettingsAction): void {
    this.settings = action.payload.settings;
    console.log(`Room ${this.name} settings updated:`, this.settings);
    this.sendActionToAll(new Actions.RoomSettingsChange(this.settings));
  }

  destroy() {
    Object.values(this.players).forEach((player) => player.destroy());
    this.players = {};
    delete Rooms[this.name];
  }

  addPlayer(player: Player): void {
    this.players[player.name] = player;
    player.addEventListener('close', () => {
      this.deactivatePlayer(player.name);
    });
    player.addActionListener(ActionEnum.LEAVE_ROOM, () => {
      this.removePlayer(player.name);
    });
    // Send current settings to the newly joined player
    player.sendAction(new Actions.RoomSettingsChange(this.settings));
    this.playerListChanged();
  }

  /** Called when a player's WebSocket closes unexpectedly (tab closed, network drop).
   * Marks them inactive and starts a 3-minute timeout before permanent removal.
   * The player can still reconnect within the timeout and resume their game slot.
   */
  deactivatePlayer(playerName: string): void {
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

  /** Forcefully and permanently removes a player from the room.
   * Resolves their pending game round slot immediately, removes them from the room,
   * and destroys the room if it becomes empty.
   * - Voluntary leave (LEAVE_ROOM): WS stays alive, put back in roomless state.
   * - Timeout after disconnect: WS is already dead, destroy it.
   */
  removePlayer(playerName: string): void {
    const playerToRemove = this.players[playerName];
    if (playerToRemove) {
      if (this.game) {
        this.game.forceCompletePlayer(playerToRemove.id);
      }
      if (playerToRemove.disconnected) {
        // WS already dead — destroy cleanly
        playerToRemove.destroy();
      } else {
        // Voluntary leave — WS is alive, return it to roomless state
        console.log(`Player ${playerName} left room ${this.name}.`);
        playerToRemove.getWebSocket().removeAllListeners();
        handleRoomless(playerToRemove.getWebSocket());
      }
      delete this.players[playerName];
      this.ensureConnectedHost();
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
    this.ensureConnectedHost();
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
    const connected = this.getConnectedPlayers();
    console.log(`[Room] sendActionToAll ${action.type} to [${connected.map((p: Player) => p.name).join(', ')}]`);
    connected.forEach((player) => {
      player.sendAction(action);
    });
  }

  startGame(): void {
    if (this.getConnectedPlayers().length < 2) {
      console.log('Not enough players to start game.');
      return;
    }
    this.getConnectedPlayers().forEach((p) => (p.score = 0));
    this.sendActionToAll(new Actions.StartGame());
    this.game = new Game(
      this.getConnectedPlayers(),
      this.sendActionToAll.bind(this),
      () => {},
      this.settings,
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
