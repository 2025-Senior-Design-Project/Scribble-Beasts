import { writable } from 'svelte/store';
import { Actions, type AnyRoundAction } from '@shared/actions';
import ClientWebsocket from '../ClientWebsocket';
import { Round, Rounds } from '@shared/rounds';

export interface RoundState {
  number: number;
  current: Round;
  ongoing: boolean;
  timeLeft: number;
}

export const roundStore = writable<RoundState>({
  number: -1,
  current: Rounds[0],
  ongoing: true,
  timeLeft: Rounds[0].timeout,
});

export function endCurrentRound(action?: AnyRoundAction) {
  roundStore.update((state) => ({
    ...state,
    ongoing: false,
  }));

  ClientWebsocket.sendAction(action ?? new Actions.EndRound());
}

export function startNextRound() {
  roundStore.update((state) => ({
    ...state,
    ongoing: true,
    number: state.number + 1,
    current: Rounds[state.number + 1] || state.current,
    timeLeft: Rounds[state.number + 1].timeout,
  }));
}
