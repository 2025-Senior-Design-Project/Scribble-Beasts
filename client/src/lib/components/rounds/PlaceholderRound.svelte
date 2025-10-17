<script lang="ts">
  import ClientWebsocket from '../../ClientWebsocket';
  import Round from '../Round.svelte';
  import { Actions } from '@shared/actions';

  async function handleRoundEnd() {
    ClientWebsocket.sendAction(new Actions.ConfirmRound());
  }
</script>

<Round onRoundEnd={handleRoundEnd}>
  <p>This is a placeholder round that demonstrates round end handling.</p>
</Round>
