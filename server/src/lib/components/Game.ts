import { initializeRounds } from './rounds/Rounds';
import { ServerRound } from './rounds/ServerRound';
import { Player } from './Player';
import {
  ActionEnum,
  Actions,
  AnyAction,
  AnyRoundAction,
  EndRoundAction,
} from '@shared/actions';
import { Round } from '@shared/rounds';

export class Game {
  #sendActionToAllPlayers: (action: AnyAction) => void;
  #backToLobby: () => void;
  roundsLeft: ServerRound[];
  currentRound: ServerRound | undefined;
  players: Player[];
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

    if (this.currentRound === undefined) {
      return this.endGame();
    }

    this.#sendActionToAllPlayers(new Actions.StartRound());

    this.currentRound.setup(this.players);

    await this.waitForRoundEnd(
      this.currentRound.expectedActions,
      this.currentRound.roundResponseHandler.bind(this.currentRound),
      (this.currentRound as unknown as Round).timeout
    );

    this.#sendActionToAllPlayers(new Actions.EndRound());
    await new Promise((res) => setTimeout(res, 2000)); // wait 2 seconds before next round

    this.nextRound();
  }

  async waitForRoundEnd(
    expectedActions: ActionEnum[],
    roundHandler: (action: AnyRoundAction, player: Player) => boolean,
    timeout: number // in seconds
  ) {
    // wait for everyone to send back an action for this round
    const waitForEveryoneToFinish = Promise.all(
      this.players.map(
        (p) =>
          new Promise((res) => {
            // player finished early or client timeout
            expectedActions.forEach((actionType) =>
              p.addActionListener<AnyRoundAction>(actionType, (action) => {
                if (roundHandler(action, p)) {
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
                res(true);
              }
            );
          })
      )
    );
    // wait for timeout
    const waitForTimeout = new Promise((res) =>
      setTimeout(res, timeout * 1000)
    );
    // wait till one of these finishes
    await Promise.race([waitForEveryoneToFinish, waitForTimeout]);

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
