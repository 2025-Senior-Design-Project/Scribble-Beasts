import { initializeRounds } from './rounds/Rounds.js';
import { ServerRound } from './rounds/ServerRound.js';
import { Player } from './Player.js';
import {
  ActionEnum,
  Actions,
  AnyAction,
  AnyRoundAction,
  SendDrawingAction,
} from '../../../../shared/actions/index.js';
import { Round } from '../../../../shared/rounds/index.js';
import { DEFAULT_ROOM_SETTINGS, type RoomSettings } from '../../../../shared/settings/index.js';

export class Game {
  #sendActionToAllPlayers: (action: AnyAction) => void;
  #backToLobby: () => void;
  #playerResolvers: Map<string, (v: boolean) => void> = new Map();
  roundsLeft: ServerRound[];
  currentRound: ServerRound | undefined;
  currentRoundNumber: number = 0;
  currentRoundTimeout: number = 0;
  roundStartTime: number = 0;
  players: Player[];
  playerDrawings: Record<string, string> = {};
  settings: RoomSettings;
  constructor(
    players: Player[],
    sendActionToAllPlayers: (action: AnyAction) => void,
    backToLobby: () => void,
    settings: RoomSettings = DEFAULT_ROOM_SETTINGS,
  ) {
    this.players = players;
    this.#sendActionToAllPlayers = sendActionToAllPlayers;
    this.#backToLobby = backToLobby;
    this.settings = settings;
    this.roundsLeft = initializeRounds(this);
  }

  async startGame() {
    if (!this.settings.skipIntro) {
      await this.playIntro();
    }
    this.nextRound();
  }

  /**
   * Broadcast INTRO_START and wait for the host to confirm INTRO_END (either
   * because the video finished naturally or the host clicked skip). A safety
   * timeout prevents the game from hanging if the host disconnects mid-intro.
   */
  async playIntro() {
    const INTRO_SAFETY_TIMEOUT_MS = 120 * 1000;
    console.log('[Game] Playing intro, waiting for host INTRO_END');
    this.#sendActionToAllPlayers(new Actions.IntroStart());

    await new Promise<void>((resolve) => {
      let resolved = false;
      const finish = () => {
        if (resolved) return;
        resolved = true;
        // cleanup listeners on all players
        this.players.forEach((p) => p.removeActionListener(ActionEnum.INTRO_END));
        clearTimeout(safety);
        resolve();
      };

      const safety = setTimeout(() => {
        console.log('[Game] Intro safety timeout reached');
        finish();
      }, INTRO_SAFETY_TIMEOUT_MS);

      // Accept INTRO_END from any host (host may change on disconnect)
      this.players.forEach((p) =>
        p.addActionListener(ActionEnum.INTRO_END, () => {
          if (!p.isHost) return;
          console.log(`[Game] INTRO_END received from host ${p.name}`);
          // Tell everyone the intro is over so non-host clients hide it.
          this.#sendActionToAllPlayers(new Actions.IntroEnd());
          finish();
        }),
      );
    });
  }

  async nextRound() {
    this.currentRound = this.roundsLeft.shift();
    this.currentRoundNumber++;
    this.roundStartTime = Date.now();

    if (this.currentRound === undefined) {
      return this.endGame();
    }

    this.currentRound.setup(this.players);

    const roundBase = this.currentRound as unknown as Round;
    const customTimer = this.settings.roundTimers[roundBase.roundType];
    const timeout = customTimer && customTimer > 0 ? customTimer : roundBase.timeout;
    this.currentRoundTimeout = timeout;

    this.#sendActionToAllPlayers(new Actions.StartRound(timeout));

    await this.waitForRoundEnd(
      this.currentRound.expectedActions,
      this.currentRound.roundResponseHandler.bind(this.currentRound),
      timeout,
    );

    console.log(`[Game] Round ${this.currentRoundNumber} complete. Sending post-wait EndRound. Connected: [${this.players.filter(p => !p.disconnected).map(p => p.name).join(', ')}]`);
    this.#sendActionToAllPlayers(new Actions.EndRound());
    // TODO: fix race condition where clients receive end round before start next round
    await new Promise((res) => setTimeout(res, 300)); // wait .3 seconds before next round

    console.log(`[Game] Advancing to next round. Connected: [${this.players.filter(p => !p.disconnected).map(p => p.name).join(', ')}]`);
    this.nextRound();
  }

  async waitForRoundEnd(
    expectedActions: ActionEnum[],
    roundHandler: (action: AnyRoundAction, player: Player) => boolean,
    timeout: number, // in seconds
  ) {
    const playerPromises = this.players.map(
      (p) =>
        new Promise<boolean>((res) => {
          this.#playerResolvers.set(p.id, res);
          // player finished early or client timeout
          expectedActions.forEach((actionType) =>
            p.addActionListener<AnyRoundAction>(actionType, (action) => {
              if (action.type === ActionEnum.SEND_DRAWING) {
                this.playerDrawings[p.id] = (
                  action as SendDrawingAction
                ).payload.image;
              }
              if (roundHandler(action, p)) {
                this.players.forEach((other) => {
                  if (other.id !== p.id) {
                    other.sendAction(new Actions.PlayerDone(p.name));
                  }
                });
                res(true);
              }
            }),
          );
        }),
    );

    // wait for timeout
    const waitForTimeout = new Promise((res) =>
      setTimeout(() => res('timeout'), timeout * 1000),
    );
    // wait till one of these finishes
    const winner = await Promise.race([
      Promise.all(playerPromises),
      waitForTimeout,
    ]);

    // If timeout won, we give players a grace period to respond to our EndRound signal
    if (winner === 'timeout') {
      console.log(`[Game] Round ${this.currentRoundNumber} timed out. Sending EndRound to all. Connected: [${this.players.filter(p => !p.disconnected).map(p => p.name).join(', ')}]`);
      this.#sendActionToAllPlayers(new Actions.EndRound());

      const gracePeriod = new Promise((res) =>
        setTimeout(() => res('grace_timeout'), 2000),
      );

      // Wait for all players to finish or grace period to end
      const graceWinner = await Promise.race([Promise.all(playerPromises), gracePeriod]);
      console.log(`[Game] Round ${this.currentRoundNumber} grace period ended (${graceWinner === 'grace_timeout' ? 'grace timeout' : 'all responded'})`);
    } else {
      console.log(`[Game] Round ${this.currentRoundNumber} all players finished before timeout`);
    }

    this.#playerResolvers.clear();

    // cleanup listeners
    expectedActions.forEach((actionType) =>
      this.players.forEach((p) => p.removeActionListener(actionType)),
    );
  }

  forceCompletePlayer(playerId: string): void {
    const resolve = this.#playerResolvers.get(playerId);
    if (resolve) {
      resolve(true);
      this.#playerResolvers.delete(playerId);
    }
  }

  endGame() {
    this.#backToLobby();
  }

  getRemainingTime(): number {
    if (!this.currentRound) return 0;
    const elapsed = (Date.now() - this.roundStartTime) / 1000;
    return Math.max(0, Math.floor(this.currentRoundTimeout - elapsed));
  }
}
