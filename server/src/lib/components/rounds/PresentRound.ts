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
    this.players = players.slice();
    this.presenters = players.slice();
    const presenter = this.presenters[randomInt(0, this.presenters.length)];
    players.forEach((p) => {
      p.sendAction(new SendPresenterChangeAction(presenter.name));
      p.sendAction(new SendDrawingAction(presenter.lastUploadedImage));
    });
  }

  roundResponseHandler(action: AnyRoundAction, player: Player): boolean {
    if (action.type == ActionEnum.PRESENTER_END) {
      this.presenters = this.presenters.filter((pl) => pl.name !== player.name);
      if (this.presenters.length === 0) {
        return true;
      }
      const nextPresenter =
        this.presenters[randomInt(0, this.presenters.length)];
      this.players.forEach((p) => {
        p.sendAction(new SendPresenterChangeAction(nextPresenter.name));
        p.sendAction(new SendDrawingAction(nextPresenter.lastUploadedImage));
      });
    }
    return false;
  }
}
