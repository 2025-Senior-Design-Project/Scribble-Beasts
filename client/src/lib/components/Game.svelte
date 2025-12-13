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

  import type { StartRoundAction } from '@shared/actions';

  onMount(() => {
    const handleServerEndRound = () => {
      endCurrentRound();
    };

    const handleServerStartRound = (action: StartRoundAction) => {
      startNextRound(action.payload.timeout);
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

<div class="flex-center-page">
  <div class="paper-card game-card">
    {#if $roundStore}
      <h1 class="text-pen-red">{$roundStore.current.roundName}</h1>

      {#if $roundStore.ongoing}
        <h3 class="text-pen-blue">{$roundStore.current.description}</h3>

        <div class="round-content">
          <svelte:component
            this={ROUND_TYPE_COMPONENT_DICT[$roundStore.current.roundType]}
            on:end={() => endCurrentRound()}
          />
        </div>
      {:else}
        <p>Great job! Wait for everyone else to finish :D</p>
      {/if}
    {/if}
  </div>
</div>

<style>
  .game-card {
    transform: rotate(-1deg);
    max-width: 50rem;
  }
  h1 {
    margin-bottom: 0.5rem;
  }
  h3 {
    margin-bottom: 1.5rem;
  }
  .round-content {
    margin-top: 2rem;
  }
</style>
