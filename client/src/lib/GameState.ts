import {
  ActionEnum,
  type HostChangeAction,
  type JoinRoomAction,
  type PlayerListChangeAction,
  type SendDrawingAction,
  type StartGameAction,
} from '@shared/actions';
import { get, writable } from 'svelte/store';
import ClientWebsocket from './ClientWebsocket';
import { View, navigateTo } from './Navigator';
import { startNextRound } from './stores/roundStore';

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

const joinRoom = (action: JoinRoomAction) => {
  const {
    roomName: roomNameValue,
    playerName: playerNameValue,
    hostName: hostNameValue,
  } = action.payload;
  roomName.set(roomNameValue);
  playerName.set(playerNameValue);
  hostName.set(hostNameValue);
  navigateTo(View.LOBBY);
};

const startGame = (action: StartGameAction) => {
  const { currentRound } = action.payload;
  if (currentRound) {
    for (let i = 0; i < currentRound; i++) {
      // This is a hack to get the round store to the correct round
      // TODO: make this better
      startNextRound(0);
    }
  }
  navigateTo(View.GAME);
};

export function resetState() {
  ClientWebsocket.removeActionListener(ActionEnum.PLAYER_LIST_CHANGE);
  ClientWebsocket.removeActionListener(ActionEnum.HOST_CHANGE);
  ClientWebsocket.removeActionListener(ActionEnum.SEND_DRAWING);
  ClientWebsocket.removeActionListener(ActionEnum.JOIN_ROOM);
  ClientWebsocket.removeActionListener(ActionEnum.START_GAME);
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
  ClientWebsocket.addActionListener<JoinRoomAction>(
    ActionEnum.JOIN_ROOM,
    joinRoom
  );
  ClientWebsocket.addActionListener<StartGameAction>(
    ActionEnum.START_GAME,
    startGame
  );
}
