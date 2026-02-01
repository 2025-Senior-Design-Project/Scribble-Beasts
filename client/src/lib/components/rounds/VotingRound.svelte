<script lang="ts">
  import { writable } from 'svelte/store';
  import { allBeasts, players } from '../../GameState';
  import Round from '../Round.svelte';
  import ClientWebsocket from '../../ClientWebsocket';
  import { ActionEnum } from '@shared/actions';
  import { roundStore } from '../../stores/roundStore';

  // Two-column layout with centered final card when odd count.
  // Compute reactive count.
  const count = $derived($allBeasts ? $allBeasts.length : 0);
  // How many picks the local player should make: min(3, players - 1)
  const maxPicks = $derived(
    $players ? Math.max(0, Math.min(3, $players.length - 1)) : 0,
  );

  // Store the user's picks here for now (exported so other modules can import if needed)
  export const userPicks = writable<any[]>([]);

  // Local picks array of indices into $allBeasts in selection order
  let picks: number[] = $state([]);

  const ordinals = ['1st', '2nd', '3rd'];

  const promptText = $derived(
    maxPicks === 0
      ? 'No votes required'
      : picks.length === 0
      ? `Pick your ${ordinals[0]} favorite beast`
      : picks.length < maxPicks
      ? `Pick your ${ordinals[picks.length]} favorite beast`
      : `You have chosen ${picks.length} picks`,
  );
  const cols = 2;

  async function handleRoundEnd() {
    // cleans up for next round + sends actions to server
  }

  function handleCardClick(i: number) {
    // If no votes required, ignore
    if (maxPicks === 0) return;

    const idx = picks.indexOf(i);
    if (idx !== -1) {
      // deselect and remove later picks (can't keep order gaps)
      picks = picks.slice(0, idx).concat(picks.slice(idx + 1));
    } else {
      if (picks.length >= maxPicks) return; // don't exceed allowed picks
      picks = [...picks, i];
    }

    // update exported store for now
    const selected = picks.map((pi) => $allBeasts[pi]);
    userPicks.set(selected);
  }

  function finishVoting() {
    // send action to server with picks
    ClientWebsocket.sendAction({
      type: ActionEnum.SEND_VOTE,
      payload: {
        first: $allBeasts[picks[0]].playerName ?? '',
        second: $allBeasts[picks[1]].playerName ?? '',
        third: $allBeasts[picks[2]].playerName ?? '',
      },
    });
    roundStore.update((state) => ({
      ...state,
      ongoing: false,
    }));
  }
</script>

<Round onRoundEnd={handleRoundEnd}>
  <div class="voting-container">
    <div class="prompt">{promptText}</div>
    {#if $allBeasts && $allBeasts.length > 0}
      <div
        class="voting-grid"
        style={`grid-template-columns: repeat(${cols}, minmax(var(--min-card-size), 1fr)); column-gap: var(--col-gap); row-gap: var(--row-gap);`}
      >
        {#each $allBeasts as beast, i (i)}
          <div
            class="card"
            class:center-span={count % 2 === 1 && i === count - 1}
            class:selected={picks.includes(i)}
            role="button"
            aria-pressed={picks.includes(i)}
            aria-label={`Drawing by ${beast.playerName}`}
            on:click={() => handleCardClick(i)}
          >
            <div class="image-wrap">
              <img src={beast.drawing} alt={`Drawing by ${beast.playerName}`} />
              {#if picks.includes(i)}
                <div class="selected-overlay" />
                <div class="badge">{picks.indexOf(i) + 1}</div>
              {/if}
            </div>
            <div class="drawer">{beast.playerName}</div>
          </div>
        {/each}
      </div>
      <div class="voting-actions">
        {#if picks.length === maxPicks && maxPicks > 0}
          <button class="btn" on:click={finishVoting}>Finish Voting</button>
        {/if}
      </div>
    {:else}
      <p>No drawings to vote on yet.</p>
    {/if}
  </div>
</Round>

<style>
  .voting-container {
    width: min(
      1400px,
      96%
    ); /* take more horizontal space but keep a comfortable max */
    margin: 0 auto;
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    gap: 1rem;
    padding: 1.25rem;
    box-sizing: border-box;
    overflow: visible; /* let the page handle scrolling */
    --min-card-size: 200px; /* adjustable minimum card dimension */
    --row-gap: 1.5rem; /* vertical separation between rows */
    --col-gap: 1.5rem; /* horizontal separation between columns */
  }

  .voting-grid {
    display: grid;
    column-gap: var(--col-gap);
    row-gap: var(--row-gap);
    align-items: start;
    align-content: start; /* stack rows from top */
    grid-auto-rows: auto; /* let rows size to their content to avoid overlap */
  }

  .card {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    background: white;
    border: 3px solid black;
    border-radius: 8px;
    padding: 8px;
    box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.08);
    min-width: var(--min-card-size);
    min-height: var(--min-card-size);
    box-sizing: border-box;
    cursor: pointer;
  }

  .card.center-span {
    grid-column: 1 / -1; /* span both columns */
    justify-self: center; /* center horizontally */
    max-width: min(720px, calc(var(--min-card-size) * 1.8));
  }

  .image-wrap {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background: white;
    flex: 1 1 auto; /* let image area grow to fill card */
    max-height: calc(var(--min-card-size) * 1.2);
  }

  .selected-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.35);
    pointer-events: none;
    border-radius: 6px;
  }

  .badge {
    position: absolute;
    top: 8px;
    right: 8px;
    background: #222;
    color: white;
    font-weight: 800;
    padding: 6px 10px;
    border-radius: 999px;
    font-size: 1rem;
    pointer-events: none;
  }

  .prompt {
    font-size: 1.25rem;
    font-weight: 700;
    text-align: center;
  }

  .voting-actions {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-top: 0.75rem;
  }

  .card img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
    background: white;
  }

  .drawer {
    margin-top: 8px;
    text-align: center;
    font-weight: 700;
    font-size: 1rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  @media (min-width: 900px) {
    .voting-grid {
      grid-template-columns: repeat(2, minmax(var(--min-card-size), 1fr));
    }
  }
</style>
