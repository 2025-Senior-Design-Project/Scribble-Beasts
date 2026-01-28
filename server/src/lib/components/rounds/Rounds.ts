import {
  ServerEndOfTheWorldRound,
  ServerWinnerRound,
} from './ConfirmationRounds.js';
import {
  ServerColorRound,
  ServerDetailRound,
  ServerLineRound,
  ServerNameRound,
  ServerScribbleRound,
} from './DrawingRounds.js';
import { ServerPresentRound } from './PresentRound.js';
import type { ServerRound } from './ServerRound.js';
import { ServerVoteRound } from './VoteRound.js';
import { Game } from '../Game.js';
import { ServerIntroRound } from './IntroRound.js';

export function initializeRounds(game: Game): ServerRound[] {
  return [
    new ServerIntroRound(game),
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
