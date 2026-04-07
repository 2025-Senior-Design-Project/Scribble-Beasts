import { RoundEnum } from '../rounds/index.js';

export type SoundMode = 'separate' | 'shared' | 'none';

export interface RoomSettings {
  /** Allow players to vote for their own beast. Always forced on for 2-player games. */
  allowSelfVote: boolean;
  /**
   * Interludes — video segments between rounds.
   * TODO: implement skip logic in round sequencing
   */
  skipIntro: boolean;
  /**
   * Skip tutorial overlays shown at the start of drawing rounds.
   * TODO: implement tutorial overlay logic in drawing rounds
   */
  skipTutorials: boolean;
  /**
   * How interlude/intro audio should play.
   * - 'separate': each player's device plays audio independently (best for remote play)
   * - 'shared': audio plays through the host's speakers only (best for in-person play)
   * - 'none': no audio plays
   * TODO: implement sound playback logic
   */
  soundMode: SoundMode;
  /** Show captions/subtitles during the intro video. */
  captions: boolean;
  /** Per-round timeout overrides in seconds. Keys are RoundEnum values. 0 = use default. */
  roundTimers: Partial<Record<RoundEnum, number>>;
}

export const DEFAULT_ROOM_SETTINGS: RoomSettings = {
  allowSelfVote: false,
  skipIntro: false,
  skipTutorials: false,
  soundMode: 'separate',
  captions: true,
  roundTimers: {},
};
