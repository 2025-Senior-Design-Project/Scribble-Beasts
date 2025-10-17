// futz with these in playtests to find the best combo
const PLACEHOLDER_TIMEOUT = 10;
const SCRIBBLE_TIMEOUT = 30;
const LINE_TIMEOUT = 120;
const COLOR_TIMEOUT = 120;
const DETAIL_TIMEOUT = 60;
const NAME_TIMEOUT = 60;
const EOTW_TIMEOUT = 15;
const PRESENT_TIMEOUT = 60;
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

export class Round {
  roundType: RoundEnum;
  timeout: number; // in seconds
  roundName: string; // should be an action
  description: string; // describe what to do for this round
  staggered: boolean; // everyone goes at once, or one by one
  hideButton: boolean; // end early button is visible
  constructor(
    roundType: RoundEnum,
    timeout: number,
    roundName: string,
    description: string,
    staggered = false,
    hideButton = false
  ) {
    this.roundType = roundType;
    this.timeout = timeout;
    this.roundName = roundName + '!';
    this.description = description;
    this.hideButton = hideButton;
    this.staggered = staggered;
  }
}

class PlaceholderRound extends Round {
  constructor() {
    super(
      RoundEnum.PLACEHOLDER,
      PLACEHOLDER_TIMEOUT,
      'Placeholder',
      'this is a dummy placeholder round'
    );
  }
}

class ScribbleRound extends Round {
  constructor() {
    super(
      RoundEnum.SCRIBBLE,
      SCRIBBLE_TIMEOUT,
      'Scribble',
      'draw your best scribble in one line, the more loops and crosses the better'
    );
  }
}

class LineRound extends Round {
  constructor() {
    super(
      RoundEnum.LINE,
      LINE_TIMEOUT,
      'Line',
      'make a beast by drawing lines over just the scribble lines'
    );
  }
}
class ColorRound extends Round {
  constructor() {
    super(
      RoundEnum.COLOR,
      COLOR_TIMEOUT,
      'Color',
      'bring your beast to life using color'
    );
  }
}

class DetailRound extends Round {
  constructor() {
    super(
      RoundEnum.DETAIL,
      DETAIL_TIMEOUT,
      'Detail',
      'add pupils, scales, feathers, lashes, and other small details'
    );
  }
}

class NameRound extends Round {
  constructor() {
    super(RoundEnum.NAME, NAME_TIMEOUT, 'Name', 'give your beast a name');
  }
}

class EndOfTheWorldRound extends Round {
  constructor() {
    super(
      RoundEnum.END_OF_THE_WORLD,
      EOTW_TIMEOUT,
      "It's the End of the World",
      "you'll need to argue how your scribble beast stops the world from ending for the following reason:"
    );
  }
}

class PresentRound extends Round {
  constructor() {
    super(
      RoundEnum.PRESENT,
      PRESENT_TIMEOUT,
      'Present',
      'present your beast to the group',
      true // staggered presentations
    );
  }
}

class VoteRound extends Round {
  constructor() {
    super(
      RoundEnum.VOTE,
      VOTE_TIMEOUT,
      'Vote',
      'vote for your favorite beasts'
    );
  }
}

class WinnerRound extends Round {
  constructor() {
    super(RoundEnum.WINNER, WINNER_TIMEOUT, 'Winner', 'congrats, gg');
  }
}

/** All rounds in order of occurrence */
export const Rounds: Round[] = [
  new PlaceholderRound(),
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
