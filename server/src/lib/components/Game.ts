import { RoundEnum, Rounds, type Round } from '@shared/rounds';
import { BLANK_PIXEL, Player } from './Player';
import {
  ActionEnum,
  Actions,
  AnyAction,
  AnyRoundAction,
  EndRoundAction,
} from '@shared/actions';

export class Game {
  #sendActionToAllPlayers: (action: AnyAction) => void;
  #backToLobby: () => void;
  roundsLeft: Round[];
  currentRound: Round | undefined;
  players: Player[];
  constructor(
    players: Player[],
    sendActionToAllPlayers: (action: AnyAction) => void,
    backToLobby: () => void
  ) {
    this.players = players;
    this.#sendActionToAllPlayers = sendActionToAllPlayers;
    this.#backToLobby = backToLobby;
    this.roundsLeft = Rounds;
  }

  startGame() {
    this.nextRound();
  }

  async nextRound() {
    this.currentRound = this.roundsLeft.shift();

    if (this.currentRound === undefined) {
      return this.endGame();
    }

    let actionType: ActionEnum;
    // take different actions based on round type and either ends the round or does some processing
    // TODO: needs to be extracted into it's own Round class later
    let roundResponseHandler = () => {
      console.log('no round handler set for ' + this.currentRound?.roundType);
      return false;
    };

    switch (this.currentRound.roundType) {
      case RoundEnum.SCRIBBLE:
        this.players.forEach((p) => (p.lastUploadedImage = BLANK_PIXEL)); // set everyone up with an empty image
      case RoundEnum.LINE:
      case RoundEnum.COLOR:
      case RoundEnum.DETAIL:
      case RoundEnum.NAME:
        // drawing round
        actionType = ActionEnum.DRAWING_ROUND;
        this.setupDrawingRound();
        break;
      case RoundEnum.END_OF_THE_WORLD:
        // end of the world round
        actionType = ActionEnum.EOTW_ROUND;
        roundResponseHandler = () => true; // always end round when someone responds
        break;
      case RoundEnum.PRESENT:
        // present round
        actionType = ActionEnum.PRESENT_ROUND;
        break;
      case RoundEnum.VOTE:
        // vote round
        actionType = ActionEnum.VOTE_ROUND;
        break;
      case RoundEnum.PLACEHOLDER:
      case RoundEnum.WINNER:
        // confirmation round
        actionType = ActionEnum.CONFIRM_ROUND;
        roundResponseHandler = () => true; // always end round when someone responds
        break;
      default:
        console.log(
          'Error! Unexpected round type: ' + this.currentRound.roundType
        );
        return;
    }

    this.#sendActionToAllPlayers(new Actions.StartRound());

    await this.waitForRoundEnd(
      actionType,
      roundResponseHandler,
      this.currentRound.timeout
    );

    this.#sendActionToAllPlayers(new Actions.EndRound());
    await new Promise((res) => setTimeout(res, 2000)); // wait 2 seconds before next round

    this.nextRound();
  }

  async waitForRoundEnd(
    actionType: ActionEnum,
    roundHandler: (args: any) => boolean,
    timeout: number // in seconds
  ) {
    // wait for everyone to send back an action for this round
    const waitForEveryoneToFinish = Promise.all(
      this.players.map(
        (p) =>
          new Promise((res) => {
            // player finished early or client timeout
            p.addActionListener<AnyRoundAction>(actionType, (action) => {
              if (roundHandler(action.payload)) {
                res(true);
              }
            });
            // end round is for unimplemented rounds
            p.addActionListener<EndRoundAction>(
              ActionEnum.END_ROUND,
              (action) => {
                roundHandler(action.payload);
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
    this.players.forEach((p) => p.removeActionListener(actionType));
    this.players.forEach((p) => p.removeActionListener(ActionEnum.END_ROUND));
  }

  /** Gives each player a new image to start with */
  setupDrawingRound() {
    // shift all images to the right
    const firstImage = this.players[0].lastUploadedImage;
    for (let i = 0; i < this.players.length - 1; i++) {
      this.players[i].sendAction(
        new Actions.DrawingRound(this.players[i + 1].lastUploadedImage)
      );
    }
    this.players[this.players.length - 1].lastUploadedImage = firstImage;
    this.players.forEach((p) =>
      p.sendAction(new Actions.DrawingRound(p.lastUploadedImage))
    );
  }

  endGame() {
    this.#backToLobby();
  }
}
