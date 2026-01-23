<script lang="ts">
  import DrawingRound from './DrawingRound.svelte';
  import { LayerMode } from '../../types/LayerMode';
</script>

<DrawingRound layerMode={LayerMode.BehindLayer} 
pen={{
    strokeStyle: 'rgb(0 0 0 / .02)',
    lineWidth: 3,
    scribble: true,
  }}/>
