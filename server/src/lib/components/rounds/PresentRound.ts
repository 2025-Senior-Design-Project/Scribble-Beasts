import { ActionEnum, AnyRoundAction } from '@shared/actions';
import { PresentRound } from '@shared/rounds';
import { ServerRound } from './ServerRound';
import { Mixin } from 'ts-mixer';
import { Player } from '../Player';

export class ServerPresentRound extends Mixin(ServerRound, PresentRound) {
  expectedActions = [
    ActionEnum.PRESENTER_CHANGE,
    ActionEnum.PRESENTER_START,
    ActionEnum.PRESENTER_END,
  ];

  setup(): void {
    // TODO: figure out who the presenter is, notify players
    // setup a listener with roundResponseHandler to handle presenter actions
    // and chooose next presenter, and end the round when appropriate
  }

  roundResponseHandler(action: AnyRoundAction, player: Player): boolean {
    // TODO: should handle changer, start, and end actions from presenter
    return true;
  }
}
