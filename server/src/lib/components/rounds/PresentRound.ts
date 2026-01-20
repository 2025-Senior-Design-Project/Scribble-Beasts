import {
  ActionEnum,
  AnyRoundAction,
} from '../../../../../shared/actions/index.js';
import { PresentRound } from '../../../../../shared/rounds/index.js';
import { ServerRound } from './ServerRound.js';
import { Mixin } from 'ts-mixer';
import { Player } from '../Player.js';

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
