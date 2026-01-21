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
  import { fly } from 'svelte/transition';
  import { cubicOut, cubicIn } from 'svelte/easing';

  import type { StartRoundAction } from '@shared/actions';

  function throwIn(node: HTMLElement, { duration = 800 }) {
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

  function fallOut(node: HTMLElement, { duration = 1000 }) {
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

<div class="flex-center-page overflow-hidden relative">
  {#if $roundStore}
    {#key roundKey}
      <div
        class="paper-card game-card transition-container"
        in:throwIn={{ duration: 800 }}
        out:fallOut={{ duration: 600 }}
      >
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
      </div>
    {/key}
  {/if}
</div>

<style>
  .transition-container {
    position: absolute;
    /* Keep it centered while absolute */
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    pointer-events: none; /* Only the card should be clickable */
  }
  .game-card {
    pointer-events: auto; /* Re-enable for the card itself */
    transform: rotate(-1deg);
    max-width: 50rem;
    position: relative;
    z-index: 1;
  }
  .game-card {
    transform: rotate(-1deg);
    max-width: 50rem;
    position: relative;
    z-index: 1;
  }

  /* Ensure the incoming card is above the outgoing one */
  :global(.transition-container:has(+ .transition-container)) {
    z-index: 0;
  }
  :global(.transition-container + .transition-container) {
    z-index: 1;
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
