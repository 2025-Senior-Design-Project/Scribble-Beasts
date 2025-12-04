import { RoundEnum } from '@shared/rounds';
import PlaceholderRound from '../components/rounds/PlaceholderRound.svelte';
import UnimplementedRound from '../components/rounds/UnimplementedRound.svelte';
import ScribbleRound from '../components/rounds/ScribbleRound.svelte';
import LineRound from '../components/rounds/LineRound.svelte';
import ColorRound from '../components/rounds/ColorRound.svelte';
import DetailRound from '../components/rounds/DetailRound.svelte';
import NameRound from '../components/rounds/NameRound.svelte';
import EotwRound from '../components/rounds/EotwRound.svelte';
import PresentationRound from '../components/rounds/PresentationRound.svelte';

export interface RoundProps {
  onEnd?: () => void;
}

//TODO: add actual components for each round type
export const ROUND_TYPE_COMPONENT_DICT: Record<
  RoundEnum,
  typeof PlaceholderRound
> = {
  [RoundEnum.PLACEHOLDER]: PlaceholderRound,
  [RoundEnum.SCRIBBLE]: ScribbleRound,
  [RoundEnum.LINE]: LineRound,
  [RoundEnum.COLOR]: ColorRound,
  [RoundEnum.DETAIL]: DetailRound,
  [RoundEnum.NAME]: NameRound,
  [RoundEnum.END_OF_THE_WORLD]: EotwRound,
  [RoundEnum.PRESENT]: PresentationRound,
  [RoundEnum.VOTE]: UnimplementedRound,
  [RoundEnum.WINNER]: UnimplementedRound,
} as const;
