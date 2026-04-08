export const MAX_NAME_LENGTH = 36;

const CONTROL_CHARS_REGEX = /[\u0000-\u001F\u007F]/g;

function toCodePoints(value: string): string[] {
  return Array.from(value);
}

export function truncateToMaxChars(value: string, max = MAX_NAME_LENGTH): string {
  return toCodePoints(value).slice(0, max).join('');
}

export function sanitizeNameInput(value: unknown, max = MAX_NAME_LENGTH): string {
  if (typeof value !== 'string') return '';
  const cleaned = value
    .normalize('NFKC')
    .replace(CONTROL_CHARS_REGEX, '')
    .trim();

  return truncateToMaxChars(cleaned, max);
}

export function sanitizeNameDraftInput(value: unknown, max = MAX_NAME_LENGTH): string {
  if (typeof value !== 'string') return '';
  const cleaned = value.normalize('NFKC').replace(CONTROL_CHARS_REGEX, '');

  return truncateToMaxChars(cleaned, max);
}

export function normalizeRoomName(value: unknown): string {
  return sanitizeNameInput(value).toUpperCase();
}

export function normalizePlayerName(value: unknown): string {
  return sanitizeNameInput(value);
}

export function normalizeBeastName(value: unknown): string {
  return sanitizeNameInput(value);
}

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object') return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}
