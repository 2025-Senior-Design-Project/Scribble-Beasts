<script lang="ts">
  import DrawingRound from './DrawingRound.svelte';
  import { LayerMode } from '../../types/LayerMode';
</script>

<DrawingRound showWidget layerMode={LayerMode.FrontLayer}
let randomFont = $state<{ name: string; size: number } | null>(null);
pen={{
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
  }}/>
