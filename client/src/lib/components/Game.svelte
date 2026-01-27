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
  import PaperTransition from './PaperTransition.svelte';

  // We want to trigger the transition whenever the round phase changes
  // Phases: start of round, end of round (waiting), next round
  const roundKey = $derived(
    `${$roundStore?.current.roundName}-${$roundStore?.ongoing}`,
  );

  const RoundComponent = $derived(
    $roundStore
      ? ROUND_TYPE_COMPONENT_DICT[$roundStore.current.roundType]
      : null,
  );

  onMount(() => {
    const handleServerEndRound = () => {
      endCurrentRound();
    };

    const handleServerStartRound = (action: StartRoundAction) => {
      startNextRound(action.payload.timeout);
    };

    ClientWebsocket.addActionListener(
      ActionEnum.END_ROUND,
      handleServerEndRound,
    );

    ClientWebsocket.addActionListener(
      ActionEnum.START_ROUND,
      handleServerStartRound,
    );

    return () => {
      ClientWebsocket.removeActionListener(ActionEnum.END_ROUND);
      ClientWebsocket.removeActionListener(ActionEnum.START_ROUND);
    };
  });
</script>

<div class="game-viewport overflow-hidden relative">
  {#if $roundStore}
    {#key roundKey}
      <PaperTransition class="game-wrapper">
        <div class="paper-card game-card">
          <h1 class="text-pen-red">{$roundStore.current.roundName}</h1>

          {#if $roundStore.ongoing}
            <h3 class="text-pen-blue">{$roundStore.current.description}</h3>

            <div class="round-content">
              {#if RoundComponent}
                <RoundComponent />
              {/if}
            </div>
          {:else}
            <p>Great job! Wait for everyone else to finish :D</p>
          {/if}
        </div>
      </PaperTransition>
    {/key}
  {/if}
</div>

<style>
  .game-viewport {
    display: grid;
    grid-template-areas: 'stack';
    justify-items: center;
    align-items: center;
    min-height: 100vh;
    width: 100%;
    padding: 1rem;
    box-sizing: border-box;
  }
  .game-viewport :global(.game-wrapper) {
    grid-area: stack;
    width: 100%;
    display: flex;
    justify-content: center;
    z-index: 1;
  }
  .game-card {
    pointer-events: auto;
    width: 100%;
    max-width: 35rem;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    transform: rotate(-1deg);
  }

  h1,
  h3 {
    margin: 0.15rem;
  }
  .round-content {
    margin-top: 0.15rem;
    width: 100%;
  }
</style>
