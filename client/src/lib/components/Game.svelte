<script type="ts">
  import { ActionEnum, Actions } from '@shared/actions';
  import { RoundEnum, Rounds } from '@shared/rounds';
  import ClientWebsocket from '../ClientWebsocket';
  import PlaceholderRound from './round-content/PlaceholderRound.svelte';
  import UnimplementedRound from './round-content/UnimplementedRound.svelte';

  let roundNumber = 0;
  let currentRound = $state(Rounds[roundNumber]);
  let ongoing = $state(true);
  let timeLeft = $state(0);

  // Note: the server is in charge of actually ending the round. This timer is a
  // glorified decoration.
  const endRound = () => {
    if (ongoing === false) return; // due to async fun, this might be called several times
    ongoing = false;

    ClientWebsocket.sendAction(new Actions.EndRound());
  };
  /** Decreases timeLeft by 1 every 1 second, when no rimeLeft, ends round */
  const tickDownTimer = async () => {
    if (timeLeft === 0) {
      endRound(); // only server can actually end the round
    }
    await setTimeout(tickDownTimer, 1000); // wait 1 second and call recursively
    if (timeLeft === 0) {
      endRound(); // only server can actually end the round
    }
    timeLeft--; // async fun, we only want to tick down timeLeft if it's non-zero
  };
  const resetTimer = () => {
    timeLeft = Rounds[roundNumber].timeout;
    tickDownTimer();
  };
  resetTimer();

  // When the server sends the end round action, go to the next round
  ClientWebsocket.addActionListener(ActionEnum.END_ROUND, () => {
    roundNumber++;
    currentRound = Rounds[roundNumber];
    resetTimer();
    ongoing = true;
  });
</script>

<div>
  <h1>{currentRound.roundName}</h1>
  {#if ongoing}
    <h3>{currentRound.description}</h3>

    <div class="round-content">
      {#if currentRound.roundType === RoundEnum.PLACEHOLDER}
        <PlaceholderRound />
      {:else if currentRound.roundType === RoundEnum.SCRIBBLE}
        <UnimplementedRound />
      {:else if currentRound.roundType === RoundEnum.LINE}
        <UnimplementedRound />
      {:else if currentRound.roundType === RoundEnum.COLOR}
        <UnimplementedRound />
      {:else if currentRound.roundType === RoundEnum.DETAIL}
        <UnimplementedRound />
      {:else if currentRound.roundType === RoundEnum.NAME}
        <UnimplementedRound />
      {:else if currentRound.roundType === RoundEnum.END_OF_THE_WORLD}
        <UnimplementedRound />
      {:else if currentRound.roundType === RoundEnum.PRESENT}
        <UnimplementedRound />
      {:else if currentRound.roundType === RoundEnum.VOTE}
        <UnimplementedRound />
      {/if}
    </div>

    <div class="timer">{timeLeft}</div>

    {#if !currentRound.hideButton}
      <button onclick={endRound}>Done</button>
    {/if}
  {:else}
    <!-- TODO: add check if ended from timeout or button, + extra end messages -->
    <p>Great job! Wait for everyone else to finish :D</p>
  {/if}
</div>
