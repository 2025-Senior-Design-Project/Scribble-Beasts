import { writable } from 'svelte/store';
import { DEFAULT_ROOM_SETTINGS, type RoomSettings } from '@shared/settings';

const browser = typeof window !== 'undefined';
const STORAGE_KEY = 'scribble-beasts-room-settings';

function defaultRoomSettings(): RoomSettings {
  return {
    ...DEFAULT_ROOM_SETTINGS,
    roundTimers: {},
  };
}

function normalize(settings: RoomSettings): RoomSettings {
  return {
    allowSelfVote: !!settings.allowSelfVote,
    skipIntro: !!settings.skipIntro,
    skipTutorials: !!settings.skipTutorials,
    soundMode:
      settings.soundMode === 'shared' || settings.soundMode === 'none'
        ? settings.soundMode
        : 'separate',
    captions: !!settings.captions,
    roundTimers: { ...(settings.roundTimers ?? {}) },
  };
}

function loadFromStorage(): RoomSettings {
  const defaults = defaultRoomSettings();
  if (!browser) return defaults;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);
    return normalize({
      ...defaults,
      ...parsed,
      roundTimers: {
        ...defaults.roundTimers,
        ...(parsed.roundTimers ?? {}),
      },
    });
  } catch {
    return defaults;
  }
}

const initial = loadFromStorage();
export const roomSettings = writable<RoomSettings>(initial);

roomSettings.subscribe((settings) => {
  if (!browser) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalize(settings)));
  } catch {}
});
