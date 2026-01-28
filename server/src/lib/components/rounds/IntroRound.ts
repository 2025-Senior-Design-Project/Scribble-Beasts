import { ServerRound } from './ServerRound.js';
import { Player } from '../Player.js';
import {
  ActionEnum,
  AnyRoundAction,
} from '../../../../../shared/actions/index.js';
import { IntroRound as SharedIntroRound } from '../../../../../shared/rounds/index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Mixin } from 'ts-mixer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const durationsPath = path.resolve(__dirname, '../../constants/durations.json');

class IntroRoundLogic extends ServerRound {
  expectedActions = [ActionEnum.PLAYER_DONE, ActionEnum.SKIP_ROUND];

  setup(players: Player[]): void {
    // Read duration dynamically
    try {
      if (fs.existsSync(durationsPath)) {
        const content = JSON.parse(fs.readFileSync(durationsPath, 'utf-8'));
        if (content.intro) {
          // 'this' is mixed with SharedIntroRound
          (this as unknown as SharedIntroRound).timeout = content.intro;
          console.log(`Set Intro timeout to ${content.intro}`);
        }
      }
    } catch (e) {
      console.error('Failed to load intro duration', e);
    }
  }

  roundResponseHandler(action: AnyRoundAction, player: Player): boolean {
    if (action.type === ActionEnum.SKIP_ROUND) {
      if (player.isHost) {
        console.log(`Host ${player.name} skipped the intro.`);
        this.game.forceEndRound();
      }
      return false;
    }
    return action.type === ActionEnum.PLAYER_DONE;
  }
}

export class ServerIntroRound extends Mixin(
  IntroRoundLogic,
  SharedIntroRound,
) {}
