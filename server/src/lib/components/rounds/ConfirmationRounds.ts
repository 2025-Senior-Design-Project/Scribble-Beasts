import {
  ActionEnum,
  AnyRoundAction,
  SendEOTWAction as SendEotwAction,
  SendWinnersAction,
} from '../../../../../shared/actions/index.js';
import {
  EndOfTheWorldRound,
  PlaceholderRound,
  WinnersRound,
} from '../../../../../shared/rounds/index.js';
import { ServerRound } from './ServerRound.js';
import { Player } from '../Player.js';
import { Mixin } from 'ts-mixer';
import { getRandomEotwCard } from '../../../../../shared/eotw/index.js';

export abstract class ServerConfirmationRound extends ServerRound {
  expectedActions = [ActionEnum.END_ROUND];

  setup(players: Player[]): void {
    // most confirmation rounds don't need setup
  }

  roundResponseHandler(action: AnyRoundAction, player: Player): boolean {
    // most confirmation rounds end immediately upon receiving a response
    return true;
  }
}

export class ServerPlaceholderRound extends Mixin(
  ServerConfirmationRound,
  PlaceholderRound,
) {}

export class ServerEndOfTheWorldRound extends Mixin(
  ServerConfirmationRound,
  EndOfTheWorldRound,
) {
  setup(players: Player[]): void {
    const card = getRandomEotwCard();
    players
      .filter((p) => !p.disconnected)
      .forEach((player) => {
        player.sendAction(new SendEotwAction(card.id));
      });
  }
}

export class ServerWinnersRound extends Mixin(
  ServerConfirmationRound,
  WinnersRound,
) {
  winners: { winner: string; beast: string }[] = [];
  setup(players: Player[]): void {
    this.winners = [];
    const top3 = players.sort((a, b) => b.score - a.score).slice(0, 3);
    top3.forEach((p) => {
      this.winners.push({ winner: p.name, beast: p.lastUploadedImage });
    });
    console.log(
      `First place: ${this.winners[0].winner} with score ${players[0].score}`,
      `Second place: ${this.winners[1].winner} with score ${players[1].score}`,
      `Third place: ${this.winners[2].winner} with score ${players[2].score}`,
    );
    players.forEach((p) => {
      p.sendAction(new SendWinnersAction(this.winners));
    });
  }
  roundResponseHandler(action: AnyRoundAction, player: Player): boolean {
    // only the host can end the game from the winner round

    if (player.isHost) {
      this.game.endGame();
      return true;
    }
    return false;
  }
}
