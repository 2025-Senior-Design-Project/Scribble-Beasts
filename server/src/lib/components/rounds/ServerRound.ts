import type { Player } from '../Player.js';
import { Game } from '../Game.js';
import {
  ActionEnum,
  AnyRoundAction,
} from '../../../../../shared/actions/index.js';

export abstract class ServerRound {
  game: Game;
  abstract expectedActions: ActionEnum[];
  constructor(game: Game) {
    this.game = game;
  }

  /** Called when the round starts */
  abstract setup(players: Player[]): void;

  /**
   * Called when a player sends a response for this round
   * @returns true if the round should end
   * */
  abstract roundResponseHandler(
    action: AnyRoundAction,
    player: Player,
  ): boolean;
}
