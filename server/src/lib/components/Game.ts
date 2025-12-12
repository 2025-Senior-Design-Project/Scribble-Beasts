import { initializeRounds } from './rounds/Rounds';
import { ServerRound } from './rounds/ServerRound';
import { Player } from './Player';
import {
  ActionEnum,
  Actions,
  AnyAction,
  AnyRoundAction,
  EndRoundAction,
  SendDrawingAction,
} from '@shared/actions';
import { Round } from '@shared/rounds';

export class Game {
  #sendActionToAllPlayers: (action: AnyAction) => void;
  #backToLobby: () => void;
  roundsLeft: ServerRound[];
  currentRound: ServerRound | undefined;
  currentRoundNumber: number = 0;
  players: Player[];
  playerDrawings: Record<string, string> = {};
  constructor(
    players: Player[],
    sendActionToAllPlayers: (action: AnyAction) => void,
    backToLobby: () => void
  ) {
    this.players = players;
    this.#sendActionToAllPlayers = sendActionToAllPlayers;
    this.#backToLobby = backToLobby;
    this.roundsLeft = initializeRounds(this);
  }

  startGame() {
    this.nextRound();
  }

  async nextRound() {
    this.currentRound = this.roundsLeft.shift();
    this.currentRoundNumber++;

    if (this.currentRound === undefined) {
      return this.endGame();
    }

    this.currentRound.setup(this.players);

    this.#sendActionToAllPlayers(
      new Actions.StartRound((this.currentRound as unknown as Round).timeout)
    );

    await this.waitForRoundEnd(
      this.currentRound.expectedActions,
      this.currentRound.roundResponseHandler.bind(this.currentRound),
      (this.currentRound as unknown as Round).timeout
    );

    this.#sendActionToAllPlayers(new Actions.EndRound());
    // TODO: fix race condition where clients receive end round before start next round
    await new Promise((res) => setTimeout(res, 300)); // wait .3 seconds before next round

    this.nextRound();
  }

  async waitForRoundEnd(
    expectedActions: ActionEnum[],
    roundHandler: (action: AnyRoundAction, player: Player) => boolean,
    timeout: number // in seconds
  ) {
    const playerPromises = this.players.map(
      (p) =>
        new Promise((res) => {
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
            })
          );
          // end round is for unimplemented rounds
          p.addActionListener<EndRoundAction>(
            ActionEnum.END_ROUND,
            (action) => {
              roundHandler(action, p);
              // end round is for unimplemented rounds
              this.players.forEach((other) => {
                if (other.id !== p.id) {
                  other.sendAction(new Actions.PlayerDone(p.name));
                }
              });
              res(true);
            }
          );
        })
    );

    // wait for timeout
    const waitForTimeout = new Promise((res) =>
      setTimeout(() => res('timeout'), timeout * 1000)
    );
    // wait till one of these finishes
    const winner = await Promise.race([
      Promise.all(playerPromises),
      waitForTimeout,
    ]);

    // If timeout won, we give players a grace period to respond to our EndRound signal
    if (winner === 'timeout') {
      this.#sendActionToAllPlayers(new Actions.EndRound());

      const gracePeriod = new Promise((res) =>
        setTimeout(() => res('grace_timeout'), 2000)
      );

      // Wait for all players to finish or grace period to end
      await Promise.race([Promise.all(playerPromises), gracePeriod]);
    }

    // cleanup listeners
    expectedActions.forEach((actionType) =>
      this.players.forEach((p) => p.removeActionListener(actionType))
    );
    this.players.forEach((p) => p.removeActionListener(ActionEnum.END_ROUND));
  }

  endGame() {
    this.#backToLobby();
  }
}
