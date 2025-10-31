<script lang="ts">
  import Round from '../Round.svelte';

  async function handleRoundEnd() {
    // cleans up for next round + sends actions to server
  }
</script>

<Round onRoundEnd={handleRoundEnd}>
  <p>This round type is not implemented yet!</p>
</Round>
