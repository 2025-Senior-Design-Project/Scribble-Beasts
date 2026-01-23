<script lang="ts">
  import DrawingRound from './DrawingRound.svelte';
  import { LayerMode } from '../../types/LayerMode';
</script>

<DrawingRound showWidget layerMode={LayerMode.BehindLayer} 
pen={{
    strokeStyle: '#db2828',
    lineWidth: 15,
    lineJoin: 'round',
    lineCap: 'round',
  }}/>

