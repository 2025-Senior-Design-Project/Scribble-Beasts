<script lang="ts">
  import DrawingRound from './DrawingRound.svelte';
  import { LayerMode } from '../../types/LayerMode';
</script>

<DrawingRound showWidget layerMode={LayerMode.FrontLayer} 
pen={{
    font: {
      name: 'TheDogAteMyHomework',
      size: 30,
    },
  }}/>
