<script lang="ts">
  import DrawingRound from './DrawingRound.svelte';
  import { LayerMode } from '../../types/LayerMode';
  import type { PenParams } from '../../types/PenParams';
  import { NAME_ROUND_TEXT_FONTS } from '../../constants/nameRoundTextFonts';

  // Pick a random font ONCE per round
  const randomFont =
    NAME_ROUND_TEXT_FONTS[Math.floor(Math.random() * NAME_ROUND_TEXT_FONTS.length)];

  const pen: PenParams = {
    textFont: randomFont,
  };
</script>

<DrawingRound showWidget layerMode={LayerMode.FrontLayer} {pen} />
