import {
  ServerPlaceholderRound,
  ServerEndOfTheWorldRound,
  ServerWinnerRound,
} from './ConfirmationRounds';
import {
  ServerColorRound,
  ServerDetailRound,
  ServerLineRound,
  ServerNameRound,
  ServerScribbleRound,
} from './DrawingRounds';
import { ServerPresentRound } from './PresentRound';
import type { ServerRound } from './ServerRound';
import { ServerVoteRound } from './VoteRound';
import { Game } from '../Game';

export function initializeRounds(game: Game): ServerRound[] {
  return [
    new ServerPlaceholderRound(game), //TODO: remove placeholder round once drawing added
    new ServerScribbleRound(game),
    new ServerLineRound(game),
    new ServerColorRound(game),
    new ServerDetailRound(game),
    new ServerNameRound(game),
    new ServerEndOfTheWorldRound(game),
    new ServerPresentRound(game),
    new ServerVoteRound(game),
    new ServerWinnerRound(game),
  ];
}
