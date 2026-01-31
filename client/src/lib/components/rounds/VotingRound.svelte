<script lang="ts">
  import { onMount } from 'svelte';
  import { allBeasts } from '../../GameState';
  import Round from '../Round.svelte';

  // Two-column layout with centered final card when odd count.
  // Compute reactive count.
  const count = $derived($allBeasts ? $allBeasts.length : 0);
  const cols = 2;

  async function handleRoundEnd() {
    // cleans up for next round + sends actions to server
  }
</script>

<Round onRoundEnd={handleRoundEnd}>
  <div class="voting-container">
    {#if $allBeasts && $allBeasts.length > 0}
      <div
        class="voting-grid"
        style={`grid-template-columns: repeat(${cols}, minmax(var(--min-card-size), 1fr)); column-gap: var(--col-gap); row-gap: var(--row-gap);`}
      >
        {#each $allBeasts as beast, i (i)}
          <div
            class="card"
            class:center-span={count % 2 === 1 && i === count - 1}
            role="group"
            aria-label={`Drawing by ${beast.playerName}`}
          >
            <div class="image-wrap">
              <img src={beast.drawing} alt={`Drawing by ${beast.playerName}`} />
            </div>
            <div class="drawer">{beast.playerName}</div>
          </div>
        {/each}
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
