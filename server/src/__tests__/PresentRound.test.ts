import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ServerPresentRound } from '../lib/components/rounds/PresentRound';
import { ActionEnum } from '../../../shared/actions';
import { DEFAULT_ROOM_SETTINGS } from '../../../shared/settings';
import { RoundEnum } from '../../../shared/rounds';
import type { Player } from '../lib/components/Player';

vi.mock('crypto', () => ({
  randomInt: vi.fn(() => 0),
}));

function makePlayer(
  id: string,
  name: string,
): Player & { sentActions: any[]; sendAction: ReturnType<typeof vi.fn> } {
  const sentActions: any[] = [];
  const sendAction = vi.fn((action: any) => {
    sentActions.push(action);
  });

  return {
    id,
    name,
    disconnected: false,
    lastUploadedImage: `image-${name}`,
    sendAction,
    sentActions,
  } as unknown as Player & {
    sentActions: any[];
    sendAction: ReturnType<typeof vi.fn>;
  };
}

describe('ServerPresentRound', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('broadcasts presenter changes with per-presenter timeout', () => {
    const forceCompletePlayer = vi.fn();
    const game = {
      forceCompletePlayer,
      settings: {
        ...DEFAULT_ROOM_SETTINGS,
        roundTimers: { [RoundEnum.PRESENT]: 42 },
      },
    };
    const players = [makePlayer('1', 'A'), makePlayer('2', 'B')];

    const round = new ServerPresentRound(game as any);
    round.setup(players);

    players.forEach((p) => {
      expect(p.sendAction).toHaveBeenCalled();
      const presenterChange = p.sentActions.find(
        (action) => action.type === ActionEnum.PRESENTER_CHANGE,
      );
      expect(presenterChange).toBeDefined();
      expect(presenterChange.payload.timeout).toBe(42);
    });
  });

  it('ignores PRESENTER_END from non-active presenters', () => {
    const game = { forceCompletePlayer: vi.fn(), settings: DEFAULT_ROOM_SETTINGS };
    const players = [makePlayer('1', 'A'), makePlayer('2', 'B')];
    const round = new ServerPresentRound(game as any);

    round.setup(players);
    const current = round.currentPresenter;
    const nonActive = players.find((p) => p.id !== current?.id)!;

    const ended = round.roundResponseHandler(
      { type: ActionEnum.PRESENTER_END, payload: {} } as any,
      nonActive,
    );

    expect(ended).toBe(false);
    expect(round.currentPresenter?.id).toBe(current?.id);
  });

  it('skips disconnected active presenter', () => {
    const game = { forceCompletePlayer: vi.fn(), settings: DEFAULT_ROOM_SETTINGS };
    const players = [
      makePlayer('1', 'A'),
      makePlayer('2', 'B'),
      makePlayer('3', 'C'),
    ];
    const round = new ServerPresentRound(game as any);

    round.setup(players);
    expect(round.currentPresenter?.id).toBe('1');

    players[0].disconnected = true;
    vi.advanceTimersByTime(300);

    expect(round.currentPresenter?.id).toBe('2');
  });

  it('times out each presenter and completes after final presenter', () => {
    const forceCompletePlayer = vi.fn();
    const game = {
      forceCompletePlayer,
      settings: {
        ...DEFAULT_ROOM_SETTINGS,
        roundTimers: { [RoundEnum.PRESENT]: 1 },
      },
    };
    const players = [makePlayer('1', 'A'), makePlayer('2', 'B')];
    const round = new ServerPresentRound(game as any);

    round.setup(players);
    expect(round.currentPresenter?.id).toBe('1');

    vi.advanceTimersByTime(1000);
    expect(round.currentPresenter?.id).toBe('2');

    vi.advanceTimersByTime(1000);
    expect(forceCompletePlayer).toHaveBeenCalledWith('1');
    expect(forceCompletePlayer).toHaveBeenCalledWith('2');
  });
});
