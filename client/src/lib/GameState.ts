import {
  ActionEnum,
  SendEOTWAction as SendEotwAction,
  type HostChangeAction,
  type JoinRoomAction,
  type PlayerListChangeAction,
  type SendDrawingAction,
  type StartGameAction,
  type PlayerDoneAction,
  type StartRoundAction,
  type SendPresenterChangeAction,
  type SendAllBeastsAction,
} from '@shared/actions';
import { derived, get, writable } from 'svelte/store';
import ClientWebsocket from './ClientWebsocket';
import { View, navigateTo } from './Navigator';
import { jumpToRound } from './stores/roundStore';
import { getEotwCardFromId, type EotwCard } from '@shared/eotw';

export const isHost = writable(false);
export const hostName = writable<string | undefined>(undefined);
export const presenterName = writable<string | undefined>(undefined);
export const playerName = writable('');
export const isPresenter = derived(
  [presenterName, playerName],
  ([$presenterName, $playerName]) => $presenterName === $playerName,
);
export const roomName = writable('');
export const currentRound = writable(0);
export const players = writable<string[]>([]);
export const playersDone = writable<string[]>([]);
export const everyoneDoneExceptYou = derived(
  [playersDone, players, playerName],
  ([$playersDone, $players, $playerName]) => {
    const otherPlayers = $players.filter((p) => p !== $playerName);
    return (
      otherPlayers.length > 0 &&
      otherPlayers.every((p) => $playersDone.includes(p))
    );
  },
);
export const drawingImage = writable<string>(''); // Base64url encoded image to draw on
export const eotwCard = writable<EotwCard>();
export const allBeasts = writable<{ playerName: string; drawing: string }[]>(
  [],
);

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

const playerChange = (action: PlayerListChangeAction) => {
  const { playerList } = action.payload;
  players.set(playerList);
};

const hostChange = (action: HostChangeAction) => {
  const { newHostName } = action.payload;
  hostName.set(newHostName);
  isHost.set(newHostName === get(playerName));
};

const startGame = (action: StartGameAction) => {
  const { currentRound, timer } = action.payload;
  // sometimes the player may reconnect mid-game, so we need to fast-forward the round store
  if (currentRound) {
    jumpToRound(currentRound - 1, timer || 0);
  }
  navigateTo(View.GAME);
};

const drawingImageChange = (action: SendDrawingAction) => {
  const { image } = action.payload;
  drawingImage.set(image);
};

const presenterChange = (action: SendPresenterChangeAction) => {
  const { newPresenter } = action.payload;
  presenterName.set(newPresenter);
};
const eotwChange = (action: SendEotwAction) => {
  const { eotwId } = action.payload;
  eotwCard.set(getEotwCardFromId(eotwId));
};

const playerDone = (action: PlayerDoneAction) => {
  const { playerName } = action.payload;
  playersDone.update((done) => [...done, playerName]);
};

const resetPlayersDone = (_action: StartRoundAction) => {
  playersDone.set([]);
};

const loadBeasts = (action: SendAllBeastsAction) => {
  allBeasts.set(action.payload.drawings);
};

export function resetState() {
  ClientWebsocket.removeActionListener(ActionEnum.JOIN_ROOM);
  ClientWebsocket.removeActionListener(ActionEnum.PLAYER_LIST_CHANGE);
  ClientWebsocket.removeActionListener(ActionEnum.HOST_CHANGE);
  ClientWebsocket.removeActionListener(ActionEnum.START_GAME);
  ClientWebsocket.removeActionListener(ActionEnum.SEND_DRAWING);
  ClientWebsocket.removeActionListener(ActionEnum.SEND_EOTW);
  ClientWebsocket.removeActionListener(ActionEnum.PLAYER_DONE);
  ClientWebsocket.removeActionListener(ActionEnum.START_ROUND);
  ClientWebsocket.removeActionListener(ActionEnum.PRESENTER_CHANGE);
  ClientWebsocket.removeActionListener(ActionEnum.PRESENTER_START);
  ClientWebsocket.removeActionListener(ActionEnum.PRESENTER_END);
  ClientWebsocket.removeActionListener(ActionEnum.SEND_ALL_BEASTS);

  ClientWebsocket.addActionListener<JoinRoomAction>(
    ActionEnum.JOIN_ROOM,
    joinRoom,
  );
  ClientWebsocket.addActionListener<PlayerListChangeAction>(
    ActionEnum.PLAYER_LIST_CHANGE,
    playerChange,
  );
  ClientWebsocket.addActionListener<HostChangeAction>(
    ActionEnum.HOST_CHANGE,
    hostChange,
  );
  ClientWebsocket.addActionListener<StartGameAction>(
    ActionEnum.START_GAME,
    startGame,
  );
  ClientWebsocket.addActionListener<SendDrawingAction>(
    ActionEnum.SEND_DRAWING,
    drawingImageChange,
  );
  ClientWebsocket.addActionListener<SendEotwAction>(
    ActionEnum.SEND_EOTW,
    eotwChange,
  );
  ClientWebsocket.addActionListener<SendPresenterChangeAction>(
    ActionEnum.PRESENTER_CHANGE,
    presenterChange,
  );
  ClientWebsocket.addActionListener<PlayerDoneAction>(
    ActionEnum.PLAYER_DONE,
    playerDone,
  );
  ClientWebsocket.addActionListener<StartRoundAction>(
    ActionEnum.START_ROUND,
    resetPlayersDone,
  );
  ClientWebsocket.addActionListener<SendAllBeastsAction>(
    ActionEnum.SEND_ALL_BEASTS,
    loadBeasts,
  );
}
