<script lang="ts">
  import DrawingRound from './DrawingRound.svelte';
  import { LayerMode } from '../../types/LayerMode';
</script>

<DrawingRound lineType="scribble" layerMode={LayerMode.BehindLayer} />
