import { ActionEnum, AnyRoundAction } from '@shared/actions';
import {
  EndOfTheWorldRound,
  PlaceholderRound,
  WinnerRound,
} from '@shared/rounds';
import { ServerRound } from './ServerRound';
import { Player } from '../Player';
import { Mixin } from 'ts-mixer';

export abstract class ServerConfirmationRound extends ServerRound {
  expectedActions = [ActionEnum.END_ROUND];

  setup(): void {
    // most confirmation rounds don't need setup
  }

  roundResponseHandler(action: AnyRoundAction, player: Player): boolean {
    // most confirmation rounds end immediately upon receiving a response
    return true;
  }
}

export class ServerPlaceholderRound extends Mixin(
  ServerConfirmationRound,
  PlaceholderRound
) {}

export class ServerEndOfTheWorldRound extends Mixin(
  ServerConfirmationRound,
  EndOfTheWorldRound
) {
  setup(): void {
    // TODO: roll eotw card
  }
}

export class ServerWinnerRound extends Mixin(
  ServerConfirmationRound,
  WinnerRound
) {
  roundResponseHandler(action: AnyRoundAction, player: Player): boolean {
    // only the host can end the game from the winner round
    if (player.isHost) {
      this.game.endGame();
      return true;
    }
    return false;
  }
}
