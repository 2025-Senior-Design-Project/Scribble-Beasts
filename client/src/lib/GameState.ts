import {
  ActionEnum,
  type HostChangeAction,
  type PlayerListChangeAction,
  type SendDrawingAction,
} from '@shared/actions';
import { get, writable } from 'svelte/store';
import ClientWebsocket from './ClientWebsocket';

export const isHost = writable(false);
export const hostName = writable<string | undefined>(undefined);
export const playerName = writable('');
export const roomName = writable('');
export const currentRound = writable(0);
export const players = writable<string[]>([]);
export const currentDrawingImage = writable<string>(''); // Base64 encoded image to draw on

const playerChange = (action: PlayerListChangeAction) => {
  const { playerList } = action.payload;
  players.set(playerList);
};

const hostChange = (action: HostChangeAction) => {
  const { newHostName } = action.payload;
  hostName.set(newHostName);
  isHost.set(newHostName === get(playerName));
};

const drawingImageChange = (action: SendDrawingAction) => {
  const { image } = action.payload;
  currentDrawingImage.set(image);
};

export function resetState() {
  ClientWebsocket.removeActionListener(ActionEnum.PLAYER_LIST_CHANGE);
  ClientWebsocket.removeActionListener(ActionEnum.HOST_CHANGE);
  ClientWebsocket.removeActionListener(ActionEnum.SEND_DRAWING);
  ClientWebsocket.addActionListener<PlayerListChangeAction>(
    ActionEnum.PLAYER_LIST_CHANGE,
    playerChange
  );
  ClientWebsocket.addActionListener<HostChangeAction>(
    ActionEnum.HOST_CHANGE,
    hostChange
  );
  ClientWebsocket.addActionListener<SendDrawingAction>(
    ActionEnum.SEND_DRAWING,
    drawingImageChange
  );
}
