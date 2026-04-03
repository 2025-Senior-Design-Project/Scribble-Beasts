import { writable } from 'svelte/store';
import { DEFAULT_ROOM_SETTINGS, type RoomSettings } from '@shared/settings';

export const roomSettings = writable<RoomSettings>({ ...DEFAULT_ROOM_SETTINGS, roundTimers: {} });
