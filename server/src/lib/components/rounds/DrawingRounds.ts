import {
  ActionEnum,
  type AnyRoundAction,
  SendDrawingAction,
} from '@shared/actions';
import {
  ColorRound,
  DetailRound,
  LineRound,
  NameRound,
  ScribbleRound,
} from '@shared/rounds';
import { BLANK_PIXEL, Player } from '../Player';
import { ServerRound } from './ServerRound';
import { Mixin } from 'ts-mixer';

export abstract class ServerDrawingRound extends ServerRound {
  expectedActions = [ActionEnum.SEND_DRAWING];

  setup(players: Player[]) {
    // shift all images to the right
    const firstImage = players[0].lastUploadedImage;
    for (let i = 0; i < players.length - 1; i++) {
      players[i].lastUploadedImage = players[i + 1].lastUploadedImage;
    }
    players[players.length - 1].lastUploadedImage = firstImage;

    //TODO: send image action to players to set their drawing to lastUploadedImage
  }

  roundResponseHandler(action: AnyRoundAction, player: Player): boolean {
    // TODO: re-enable this when drawing upload is implemented
    /*if (action.type == ActionEnum.SEND_DRAWING) {
      player.lastUploadedImage = (action as SendDrawingAction).payload.image;
      return true;
    }*/
    return false;
  }
}

export class ServerScribbleRound extends Mixin(
  ServerDrawingRound,
  ScribbleRound
) {
  setup(players: Player[]): void {
    // set everyone up with an empty image
    players.forEach((p) => (p.lastUploadedImage = BLANK_PIXEL));
    super.setup(players); // shift images (all will be blank) & send to players
  }
}

export class ServerLineRound extends Mixin(ServerDrawingRound, LineRound) {}

export class ServerColorRound extends Mixin(ServerDrawingRound, ColorRound) {}

export class ServerDetailRound extends Mixin(ServerDrawingRound, DetailRound) {}

export class ServerNameRound extends Mixin(ServerDrawingRound, NameRound) {}
