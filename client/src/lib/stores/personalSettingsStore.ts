import { writable } from 'svelte/store';

const browser = typeof window !== 'undefined';

export type FontChoice = 'Children' | 'DadHand' | 'Daniel' | 'OhMaria' | 'OpenDyslexic';
export type FontSize = 'small' | 'normal' | 'large' | 'xlarge';

export interface PersonalSettings {
  /** UI font. 'OpenDyslexic' enables dyslexia-friendly rendering. */
  font: FontChoice;
  fontSize: FontSize;
  /** Personal sound volume from 0 (muted) to 1 (full). */
  soundVolume: number;
}

const STORAGE_KEY = 'scribble-beasts-personal-settings';

const FONT_SCALE: Record<FontSize, number> = {
  small: 0.9,
  normal: 1.1,
  large: 1.3,
  xlarge: 1.55,
};

const defaults: PersonalSettings = {
  font: 'Children',
  fontSize: 'normal',
  soundVolume: 1,
};

function normalize(settings: PersonalSettings): PersonalSettings {
  const next = { ...settings };
  if (typeof next.soundVolume !== 'number' || Number.isNaN(next.soundVolume)) {
    next.soundVolume = defaults.soundVolume;
  } else {
    next.soundVolume = Math.min(1, Math.max(0, next.soundVolume));
  }
  return next;
}

function loadFromStorage(): PersonalSettings {
  if (!browser) return defaults;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    return normalize({ ...defaults, ...JSON.parse(raw) });
  } catch {
    return defaults;
  }
}

function applyToDom(settings: PersonalSettings) {
  if (!browser) return;
  const root = document.documentElement;
  root.style.setProperty('--font-scale', String(FONT_SCALE[settings.fontSize]));
  const fontFamily = settings.font === 'OpenDyslexic'
    ? 'OpenDyslexic, sans-serif'
    : `'${settings.font}', sans-serif`;
  root.style.setProperty('--ui-font', fontFamily);
}

const initial = loadFromStorage();
applyToDom(initial);

export const personalSettings = writable<PersonalSettings>(initial);

personalSettings.subscribe((settings) => {
  if (!browser) return;
  const normalized = normalize(settings);
  if (normalized.soundVolume !== settings.soundVolume) {
    personalSettings.set(normalized);
    return;
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  } catch {}
  applyToDom(normalized);
});
