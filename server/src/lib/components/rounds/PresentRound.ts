import {
  ActionEnum,
  AnyRoundAction,
  SendDrawingAction,
  SendPresenterChangeAction,
} from '../../../../../shared/actions/index.js';
import { PresentRound } from '../../../../../shared/rounds/index.js';
import { ServerRound } from './ServerRound.js';
import { Mixin } from 'ts-mixer';
import { Player } from '../Player.js';
import { randomInt } from 'crypto';

export class ServerPresentRound extends Mixin(ServerRound, PresentRound) {
  expectedActions = [
    ActionEnum.PRESENTER_CHANGE,
    ActionEnum.PRESENTER_START,
    ActionEnum.PRESENTER_END,
    ActionEnum.SEND_DRAWING,
  ];
  presenters: Player[] = [];
  players: Player[] = [];
  currentPresenter: Player | undefined;

  setup(players: Player[]): void {
    // unchanging list of all players
    this.players = players.slice();
    // this list will change
    this.presenters = players.slice();
    // pick a random presenter to start
    const presenter = this.presenters[randomInt(0, this.presenters.length)];
    this.currentPresenter = presenter;
    players.forEach((p) => {
      p.sendAction(new SendPresenterChangeAction(presenter.name));
      p.sendAction(new SendDrawingAction(presenter.lastUploadedImage));
    });
  }

  roundResponseHandler(action: AnyRoundAction, player: Player): boolean {
    if (action.type == ActionEnum.PRESENTER_END) {
      // remove this presenter from the list
      this.presenters = this.presenters.filter((pl) => pl.name !== player.name);
      if (this.presenters.length === 0) {
        // All presentations done — force-complete every other player
        // so Promise.all in waitForRoundEnd resolves.
        this.players.forEach((p) => {
          if (p.id !== player.id) {
            this.game.forceCompletePlayer(p.id);
          }
        });
        return true;
      }
      // pick a new presenter at random
      const nextPresenter =
        this.presenters[randomInt(0, this.presenters.length)];
      this.currentPresenter = nextPresenter;
      this.players.forEach((p) => {
        p.sendAction(new SendPresenterChangeAction(nextPresenter.name));
        p.sendAction(new SendDrawingAction(nextPresenter.lastUploadedImage));
      });
    }
    return false;
  }

  sendReconnectState(player: Player): void {
    if (this.currentPresenter) {
      player.sendAction(new SendPresenterChangeAction(this.currentPresenter.name));
      player.sendAction(new SendDrawingAction(this.currentPresenter.lastUploadedImage));
    }
  }
}
