import { ActionEnum, AnyRoundAction } from '@shared/actions';
import { VoteRound } from '@shared/rounds';
import { ServerRound } from './ServerRound';
import { Mixin } from 'ts-mixer';
import { Player } from '../Player';

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
