import {
  ActionEnum,
  AnyRoundAction,
} from '../../../../../shared/actions/index.js';
import { VoteRound } from '../../../../../shared/rounds/index.js';
import { ServerRound } from './ServerRound.js';
import { Mixin } from 'ts-mixer';
import { Player } from '../Player.js';

export class ServerVoteRound extends Mixin(ServerRound, VoteRound) {
  expectedActions = [ActionEnum.SEND_VOTE];

  setup(): void {
    // TODO: initalize vote tracking structures
  }

  roundResponseHandler(action: AnyRoundAction, player: Player): boolean {
    // TODO: keep track of votes internally
    // make sure each player only votes once
    return true;
  }
}
