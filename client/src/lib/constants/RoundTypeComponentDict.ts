import { RoundEnum } from '@shared/rounds';
import PlaceholderRound from '../components/rounds/PlaceholderRound.svelte';
import UnimplementedRound from '../components/rounds/UnimplementedRound.svelte';

export interface RoundProps {
  onEnd?: () => void;
}

//TODO: add actual components for each round type
export const ROUND_TYPE_COMPONENT_DICT: Record<
  RoundEnum,
  typeof PlaceholderRound
> = {
  [RoundEnum.PLACEHOLDER]: PlaceholderRound,
  [RoundEnum.SCRIBBLE]: UnimplementedRound,
  [RoundEnum.LINE]: UnimplementedRound,
  [RoundEnum.COLOR]: UnimplementedRound,
  [RoundEnum.DETAIL]: UnimplementedRound,
  [RoundEnum.NAME]: UnimplementedRound,
  [RoundEnum.END_OF_THE_WORLD]: UnimplementedRound,
  [RoundEnum.PRESENT]: UnimplementedRound,
  [RoundEnum.VOTE]: UnimplementedRound,
  [RoundEnum.WINNER]: UnimplementedRound,
} as const;
