// futz with these in playtests to find the best combo
const PLACEHOLDER_TIMEOUT = 10;
const SCRIBBLE_TIMEOUT = 30;
const LINE_TIMEOUT = 120;
const COLOR_TIMEOUT = 120;
const DETAIL_TIMEOUT = 60;
const NAME_TIMEOUT = 60;
const EOTW_TIMEOUT = 20;
const PRESENT_TIMEOUT = 6000;
const VOTE_TIMEOUT = 60;
const WINNER_TIMEOUT = 600;

export const enum RoundEnum {
  PLACEHOLDER = 'PLACEHOLDER',
  SCRIBBLE = 'SCRIBBLE',
  LINE = 'LINE',
  COLOR = 'COLOR',
  DETAIL = 'DETAIL',
  NAME = 'NAME',
  END_OF_THE_WORLD = 'END_OF_THE_WORLD',
  PRESENT = 'PRESENT',
  VOTE = 'VOTE',
  WINNER = 'WINNER',
}

export abstract class Round {
  abstract roundType: RoundEnum;
  abstract timeout: number; // in seconds
  abstract roundName: string; // should be an action
  abstract description: string; // describe what to do for this round
  staggered = false; // everyone goes at once, or one by one
  hideButton = false; // end early button is visible
}

export class PlaceholderRound extends Round {
  roundType = RoundEnum.PLACEHOLDER;
  timeout = PLACEHOLDER_TIMEOUT;
  roundName = 'Placeholder';
  description = 'this is a dummy placeholder round';
}

export class ScribbleRound extends Round {
  roundType = RoundEnum.SCRIBBLE;
  timeout = SCRIBBLE_TIMEOUT;
  roundName = 'Scribble';
  description =
    'draw your best scribble in one line, the more loops and crosses the better. Make sure you scribble A TON, others will need to make beasts out of them later.';
}

export class LineRound extends Round {
  roundType = RoundEnum.LINE;
  timeout = LINE_TIMEOUT;
  roundName = 'Line';
  description = 'make a beast by drawing lines over just the scribble lines';
}

export class ColorRound extends Round {
  roundType = RoundEnum.COLOR;
  timeout = COLOR_TIMEOUT;
  roundName = 'Color';
  description = 'bring your beast to life using color';
}

export class DetailRound extends Round {
  roundType = RoundEnum.DETAIL;
  timeout = DETAIL_TIMEOUT;
  roundName = 'Detail';
  description = 'add pupils, scales, feathers, lashes, and other small details';
}

export class NameRound extends Round {
  roundType = RoundEnum.NAME;
  timeout = NAME_TIMEOUT;
  roundName = 'Name';
  description = 'give your beast a name';
}

export class EndOfTheWorldRound extends Round {
  roundType = RoundEnum.END_OF_THE_WORLD;
  timeout = EOTW_TIMEOUT;
  roundName = "It's the End of the World";
  description =
    "you'll need to argue how your scribble beast stops the world from ending for the following reason:";
}

export class PresentRound extends Round {
  roundType = RoundEnum.PRESENT;
  timeout = PRESENT_TIMEOUT;
  roundName = 'Present';
  description = 'present your beast to the group';
  staggered = true;
}

export class VoteRound extends Round {
  roundType = RoundEnum.VOTE;
  timeout = VOTE_TIMEOUT;
  roundName = 'Vote';
  description = 'vote for your favorite beasts';
}

export class WinnerRound extends Round {
  roundType = RoundEnum.WINNER;
  timeout = WINNER_TIMEOUT;
  roundName = 'Winner';
  description = 'congrats, gg';
}

/** All rounds in order of occurrence */
export const Rounds: Round[] = [
  // new PlaceholderRound(), // removed now that we have real rounds
  new ScribbleRound(),
  new LineRound(),
  new ColorRound(),
  new DetailRound(),
  new NameRound(),
  new EndOfTheWorldRound(),
  new PresentRound(),
  new VoteRound(),
  new WinnerRound(),
];
