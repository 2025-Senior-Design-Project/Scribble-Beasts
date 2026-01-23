<script lang="ts">
  import DrawingRound from './DrawingRound.svelte';
  import { LayerMode } from '../../types/LayerMode';
</script>

<DrawingRound layerMode={LayerMode.FrontLayer} 
pen={{
    strokeStyle: 'black',
    lineWidth: 4,
  }}/>
