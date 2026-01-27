import {
  ActionEnum,
  AnyRoundAction,
  SendDrawingAction,
  SendPresenterChangeAction,
} from '@shared/actions';
import { PresentRound } from '@shared/rounds';
import { ServerRound } from './ServerRound';
import { Mixin } from 'ts-mixer';
import { Player } from '../Player';
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

  setup(players: Player[]): void {
    // unchanging list of all players
    this.players = players.slice();
    // this list will change
    this.presenters = players.slice();
    // pick a random presenter to start
    const presenter = this.presenters[randomInt(0, this.presenters.length)];
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
        return true;
      }
      // pick a new presenter at random
      const nextPresenter =
        this.presenters[randomInt(0, this.presenters.length)];
      this.players.forEach((p) => {
        p.sendAction(new SendPresenterChangeAction(nextPresenter.name));
        p.sendAction(new SendDrawingAction(nextPresenter.lastUploadedImage));
      });
    }
    return true;
  }
}
