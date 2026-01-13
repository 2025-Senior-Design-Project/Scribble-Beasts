<script lang="ts">
  import DrawingRound from './DrawingRound.svelte';
  import { LayerMode } from '../../types/LayerMode';
</script>

<DrawingRound lineType="color" showWidget layerMode={LayerMode.BehindLayer} />

