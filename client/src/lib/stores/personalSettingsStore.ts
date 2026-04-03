import { writable } from 'svelte/store';

const browser = typeof window !== 'undefined';

export type FontChoice = 'Children' | 'DadHand' | 'Daniel' | 'OhMaria' | 'OpenDyslexic';
export type FontSize = 'small' | 'normal' | 'large' | 'xlarge';

export interface PersonalSettings {
  /** UI font. 'OpenDyslexic' enables dyslexia-friendly rendering. */
  font: FontChoice;
  fontSize: FontSize;
  // TODO: implement sound settings
  // soundVolume: number; // 0–1
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
};

function loadFromStorage(): PersonalSettings {
  if (!browser) return defaults;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    return { ...defaults, ...JSON.parse(raw) };
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
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {}
  applyToDom(settings);
});
