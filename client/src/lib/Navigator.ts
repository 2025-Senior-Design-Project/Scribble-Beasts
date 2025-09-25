import { writable } from 'svelte/store';

export const enum View {
  ROOM_FORM = 'ROOM_FORM',
  LOBBY = 'LOBBY',
  GAME = 'GAME',
}

export const currentView = writable<View>(View.ROOM_FORM);

export function navigateTo(view: View) {
  console.log(`Navigating to ${view}`);
  currentView.set(view);
}
