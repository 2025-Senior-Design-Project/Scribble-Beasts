<script lang="ts">
  import { onMount } from 'svelte';
  import { cubicOut } from 'svelte/easing';
  import {
    endCurrentRound,
    roundStore,
    startNextRound,
  } from '../stores/roundStore';
  import { ActionEnum } from '@shared/actions';
  import ClientWebsocket from '../ClientWebsocket';
  import { ROUND_TYPE_COMPONENT_DICT } from '../constants/RoundTypeComponentDict';

  import type { StartRoundAction } from '@shared/actions';

  function throwIn(node: HTMLElement, { duration = 800 } = {}) {
    return {
      duration,
      css: (t: number) => {
        const eased = cubicOut(t);
        const x = 500 * (1 - eased);
        const y = -500 * (1 - eased);
        const rotation = 20 * (1 - eased) - 1;
        return `
					transform: translate(${x}px, ${y}px) rotate(${rotation}deg);
					opacity: ${t};
				`;
      },
    };
  }

  function fallOut(node: HTMLElement, { duration = 1000 } = {}) {
    return {
      duration,
      css: (t: number) => {
        // t goes from 1 to 0
        // We want a delay: bottom pane moves a bit while top arrives (t: 1.0 -> 0.4)
        // Then continues down and fades (t: 0.4 -> 0.0)
        let y;
        let opacity;

        if (t > 0.4) {
          // Landing phase: move only 30px down
          const progress = (1 - t) / 0.6; // 0.0 to 1.0
          y = progress * 30;
          opacity = 1;
        } else {
          // Falling phase: move from 30px to 500px and fade
          const progress = (0.4 - t) / 0.4; // 0.0 to 1.0
          y = 30 + progress * 470;
          opacity = 1 - progress;
        }

        return `
					transform: translateY(${y}px) rotate(-1deg);
					opacity: ${opacity};
				`;
      },
    };
  }

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
      <div class="paper-card game-card" in:throwIn out:fallOut>
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
  .game-card {
    grid-area: stack;
    pointer-events: auto;
    width: 100%;
    max-width: 35rem;
    position: relative;
    z-index: 1;
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
