import {
  ActionEnum,
  AnyRoundAction,
  SendAllBeastsAction,
  SendVoteAction,
} from '../../../../../shared/actions/index.js';
import { VoteRound } from '../../../../../shared/rounds/index.js';
import { ServerRound } from './ServerRound.js';
import { Mixin } from 'ts-mixer';
import { Player } from '../Player.js';

export class ServerVoteRound extends Mixin(ServerRound, VoteRound) {
  expectedActions = [ActionEnum.SEND_VOTE];
  players: Player[] = [];
  votedPlayers: Set<string> = new Set();
  setup(players: Player[]): void {
    this.players = players;
    players.forEach((p) => {
      const drawings = players.map((pl) => {
        return { playerName: pl.name, drawing: pl.lastUploadedImage };
      });
      p.sendAction(new SendAllBeastsAction(drawings));
    });
  }

  roundResponseHandler(action: AnyRoundAction, player: Player): boolean {
    if (action.type == ActionEnum.SEND_VOTE) {
      if (this.votedPlayers.has(player.name)) {
        return true;
      }
      this.votedPlayers.add(player.name);
      const { first, second, third } = (action as SendVoteAction).payload;
      this.players
        .filter((p) => p.name === first)
        .forEach((p) => p.setScore(p.score + 3));
      this.players
        .filter((p) => p.name === second)
        .forEach((p) => p.setScore(p.score + 2));
      this.players
        .filter((p) => p.name === third)
        .forEach((p) => p.setScore(p.score + 1));
      return true;
    }
    return false;
  }
}
