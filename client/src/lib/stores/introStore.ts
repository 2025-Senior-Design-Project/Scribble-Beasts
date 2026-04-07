import { writable } from 'svelte/store';

/** Whether the pre-game intro video should currently be displayed. */
export const introPlaying = writable(false);
