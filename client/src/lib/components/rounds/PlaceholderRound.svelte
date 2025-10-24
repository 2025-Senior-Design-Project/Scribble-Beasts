<script lang="ts">
  import Round from '../Round.svelte';

  async function handleRoundEnd() {
    // base function will already send end round action for us
  }
</script>

<Round onRoundEnd={handleRoundEnd}>
  <p>This is a placeholder round that demonstrates round end handling.</p>
</Round>
