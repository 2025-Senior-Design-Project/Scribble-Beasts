import { get, writable } from 'svelte/store';
import { Actions, type AnyRoundAction } from '@shared/actions';
import ClientWebsocket from '../ClientWebsocket';
import { Round, Rounds } from '@shared/rounds';
import { everyoneDoneExceptYou } from '../GameState';

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
  if (!get(everyoneDoneExceptYou)) {
    roundStore.update((state) => ({
      ...state,
      ongoing: false,
    }));
  }

  ClientWebsocket.sendAction(action ?? new Actions.EndRound());
}

export function startNextRound(timeout: number) {
  roundStore.update((state) => ({
    ...state,
    ongoing: true,
    number: state.number + 1,
    current: Rounds[state.number + 1] || state.current,
    timeLeft: timeout,
  }));
}

export function jumpToRound(roundNumber: number, timeout: number) {
  roundStore.update((state) => {
    let current = Rounds[roundNumber];
    let actualRoundNumber = roundNumber;

    if (!current) {
      if (roundNumber < 0) {
        // set to first round
        current = Rounds[0];
        actualRoundNumber = 0;
      } else {
        // set to last round
        current = Rounds[Rounds.length - 1];
        actualRoundNumber = Rounds.length - 1;
      }
      console.log(
        `Round ${roundNumber} is out of bounds. Jumping to round ${actualRoundNumber}.`
      );
    }

    return {
      ...state,
      ongoing: true,
      number: actualRoundNumber,
      current,
      timeLeft: timeout,
    };
  });
}
