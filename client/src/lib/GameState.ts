import {
  ActionType,
  type HostChangeAction,
  type PlayerListChangeAction,
} from '@shared/actions';
import { get, writable } from 'svelte/store';
import ClientWebsocket from './ClientWebsocket';

export const isHost = writable(false);
export const hostName = writable<string | undefined>(undefined);
export const playerName = writable('');
export const roomName = writable('');
export const currentRound = writable(0);
export const players = writable<string[]>([]);

const playerChange = (action: PlayerListChangeAction) => {
  const { playerList } = action.payload;
  players.set(playerList);
};

const hostChange = (action: HostChangeAction) => {
  const { newHostName } = action.payload;
  hostName.set(newHostName);
  isHost.set(newHostName === get(playerName));
};

export function resetState() {
  ClientWebsocket.removeActionListener(ActionType.PLAYER_LIST_CHANGE);
  ClientWebsocket.removeActionListener(ActionType.HOST_CHANGE);
  ClientWebsocket.addActionListener<PlayerListChangeAction>(
    ActionType.PLAYER_LIST_CHANGE,
    playerChange
  );
  ClientWebsocket.addActionListener<HostChangeAction>(
    ActionType.HOST_CHANGE,
    hostChange
  );
}
