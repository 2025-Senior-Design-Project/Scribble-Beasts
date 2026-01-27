<script lang="ts">
  import { roundStore, endCurrentRound } from '../stores/roundStore';
  import { get } from 'svelte/store';
  import ClientWebsocket from '../ClientWebsocket';
  import { onMount } from 'svelte';
  import { ActionEnum } from '@shared/actions';
  import { type Snippet } from 'svelte';

  let { children, onRoundEnd }: { 
    children: Snippet;
    onRoundEnd: () => Promise<void> | void;
  } = $props();

  let canClickDone = $state(false);

  async function handleEnd() {
    // Let the round send its end action (same for timeout or button click)
    await onRoundEnd();
    endCurrentRound();
  }

  // Handle server-initiated round ends and timer tick
  onMount(() => {
    const currentState = get(roundStore);
    const elapsed = currentState.current.timeout - currentState.timeLeft;
    // 5 second anti-spam delay
    const remainingDelay = 5000 - elapsed * 1000;

    let enableButtonTimer: ReturnType<typeof setTimeout> | undefined;

    if (remainingDelay <= 0) {
      canClickDone = true;
    } else {
      enableButtonTimer = setTimeout(() => {
        canClickDone = true;
      }, remainingDelay);
    }

    ClientWebsocket.addActionListener(ActionEnum.END_ROUND, handleEnd);

    // Initialize timer when round becomes active
    const unsubscribe = roundStore.subscribe((state) => {
      if (state.ongoing && state.timeLeft === 0) {
        // Round is active but timer not initialized
        roundStore.update((s) => ({ ...s, timeLeft: s.current.timeout }));
      }
    });

    const interval = setInterval(() => {
      const s = get(roundStore);
      if (!s.ongoing || s.timeLeft <= 0) return;

      if (s.timeLeft === 1) {
        // last tick -> end the round
        endCurrentRound();
        return;
      }

      roundStore.update((st) => ({ ...st, timeLeft: st.timeLeft - 1 }));
    }, 1000);

    return () => {
      clearInterval(interval);
      unsubscribe();
      ClientWebsocket.removeActionListener(ActionEnum.END_ROUND);
      clearTimeout(enableButtonTimer);
    };
  });

</script>

<div class="round-container">
  {@render children()}

  <div class="round-footer">
    <div class="timer">{$roundStore?.timeLeft ?? 0}s</div>

    {#if !$roundStore?.current.hideButton}
      <button
        onclick={handleEnd}
        disabled={!canClickDone}
        class="done-button"
        class:hidden-until-active={!canClickDone}>Done</button
      >
    {/if}
  </div>
</div>

<style>
  .hidden-until-active {
    opacity: 0.1;
    cursor: not-allowed;
  }
  .round-container {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .round-footer {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .timer {
    font-size: var(--text-xl);
    font-weight: bold;
  }
  .done-button {
    position: fixed;
    bottom: 1rem;
    right: 1rem;
    z-index: 999;
  }
</style>
