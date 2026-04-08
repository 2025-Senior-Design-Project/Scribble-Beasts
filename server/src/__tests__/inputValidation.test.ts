import { describe, expect, it } from 'vitest';
import {
  MAX_NAME_LENGTH,
  normalizeBeastName,
  normalizePlayerName,
  normalizeRoomName,
  sanitizeNameDraftInput,
} from '../../../shared/inputValidation.js';

describe('inputValidation', () => {
  it('uppercases room names and preserves emojis/special characters', () => {
    expect(normalizeRoomName(' room!🔥abc ')).toBe('ROOM!🔥ABC');
  });

  it('limits player and beast names to 36 characters', () => {
    const overLimit = 'a'.repeat(MAX_NAME_LENGTH + 8);
    expect(normalizePlayerName(overLimit).length).toBe(MAX_NAME_LENGTH);
    expect(normalizeBeastName(overLimit).length).toBe(MAX_NAME_LENGTH);
  });

  it('removes control characters while keeping visible symbols', () => {
    expect(normalizePlayerName("A\nB\t⭐")).toBe('AB⭐');
  });

  it('preserves trailing spaces while typing', () => {
    expect(sanitizeNameDraftInput('Beast  ')).toBe('Beast  ');
    expect(sanitizeNameDraftInput("A\nB ")).toBe('AB ');
  });
});
