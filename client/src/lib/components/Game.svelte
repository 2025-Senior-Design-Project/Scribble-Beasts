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

<div class="container">
  <div class="game-card">
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
</div>

<style>
  .container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
  }
  .game-card {
    background-color: var(--paper-white);
    padding: 2.5rem;
    border-radius: 0.25rem;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
    transform: rotate(-1deg);
    width: 100%;
    max-width: 50rem;
    text-align: center;
  }
  h1 {
    color: var(--pen-red);
    margin-bottom: 0.5rem;
  }
  h3 {
    color: var(--pen-blue);
    margin-bottom: 1.5rem;
  }
  .round-content {
    margin-top: 2rem;
  }
</style>
