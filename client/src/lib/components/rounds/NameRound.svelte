<script lang="ts">
  import DrawingRound from './DrawingRound.svelte';
  import { LayerMode } from '../../types/LayerMode';
  import type { PenParams } from '../../types/PenParams';

  const FONTS = [
    { name: 'AckiPreschool', size: 30 },
    { name: 'BrownBagLunch', size: 30 },
    { name: 'Children', size: 30 },
    { name: 'DadHand', size: 30 },
    { name: 'Daniel', size: 30 },
    { name: 'OhMaria', size: 30 },
    { name: 'PopcornMountain', size: 30 },
    { name: 'SchoolTeacher', size: 30 },
    { name: 'SierraNevadaRoad', size: 30 },
    { name: 'TheDogAteMyHomework', size: 30 },
    { name: 'ThinPencilHandwriting', size: 30 },
    { name: 'WCManoNegraBta', size: 30 },
    { name: 'Yahfie', size: 30 },
  ];

  // Pick a random font ONCE per round
  const randomFont = FONTS[Math.floor(Math.random() * FONTS.length)];

  const pen: PenParams = {
    font: randomFont,
  };
</script>

<DrawingRound showWidget layerMode={LayerMode.FrontLayer} {pen} />
