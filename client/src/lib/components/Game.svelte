<script lang="ts">
  import { onMount } from 'svelte';
  import {
    endCurrentRound,
    roundStore,
    startNextRound,
  } from '../stores/roundStore';
  import { ActionEnum } from '@shared/actions';
  import ClientWebsocket from '../ClientWebsocket';
  import { ROUND_TYPE_COMPONENT_DICT } from '../constants/RoundTypeComponentDict';

  onMount(() => {
    const handleServerEndRound = () => {
      endCurrentRound();
    };

    const handleServerStartRound = () => {
      startNextRound();
    };

    ClientWebsocket.addActionListener(
      ActionEnum.END_ROUND,
      handleServerEndRound
    );

    ClientWebsocket.addActionListener(
      ActionEnum.START_ROUND,
      handleServerStartRound
    );

    return () => {
      ClientWebsocket.removeActionListener(ActionEnum.END_ROUND);
      ClientWebsocket.removeActionListener(ActionEnum.START_ROUND);
    };
  });
</script>

<div>
  {#if $roundStore}
    <h1>{$roundStore.current.roundName}</h1>

    {#if $roundStore.ongoing}
      <h3>{$roundStore.current.description}</h3>

      <div class="round-content">
        <svelte:component
          this={ROUND_TYPE_COMPONENT_DICT[$roundStore.current.roundType]}
          on:end={() => endCurrentRound()}
        />
      </div>
    {:else}
      <!-- TODO: add check if ended from timeout or button for diff message -->
      <p>Great job! Wait for everyone else to finish :D</p>
    {/if}
  {/if}
</div>
