<script lang="ts">
  import { winners } from '../../GameState';
  import Round from '../Round.svelte';

  async function handleRoundEnd() {
    // cleans up for next round + sends actions to server
  }

  // Positions for 1st, 2nd, 3rd place beasts sitting on top of each podium platform
  const podiumPositions = [
    { left: 50, bottom: 44 }, // 1st place — center (tallest)
    { left: 18, bottom: 30 }, // 2nd place — left
    { left: 82, bottom: 26 }, // 3rd place — right
  ];
</script>

<Round onRoundEnd={handleRoundEnd}>
  <div class="podium">
    <img src="/images/podium/podium.png" alt="Podium" class="podium-image" />
    {#each $winners as winner, i}
      <div
        class="winner"
        style="left: {podiumPositions[i].left}%; bottom: {podiumPositions[i]
          .bottom}%;"
      >
        <span class="winner-name">{winner.winner}</span>
        <img src={winner.beast} alt={`${i + 1} place beast`} />
      </div>
    {/each}
  </div>
</Round>

<style>
  .podium {
    position: relative;
    aspect-ratio: 1 / 1;
    height: 100%;
    max-width: 100%;
    margin: 0 auto;
  }
  .podium-image {
    width: 100%;
    height: 100%;
  }
  .winner {
    position: absolute;
    transform: translateX(-50%);
    height: 35%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .winner img {
    height: 100%;
    width: auto;
    object-fit: contain;
    flex-shrink: 1;
    min-height: 0;
  }
  .winner-name {
    font-size: 1.5cqh;
    font-weight: bold;
    text-align: center;
    white-space: nowrap;
  }
</style>
