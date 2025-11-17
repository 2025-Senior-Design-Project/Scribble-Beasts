<script lang="ts">
  import { Actions, ActionEnum } from '@shared/actions';
  import ClientWebsocket from '../ClientWebsocket';
  import { hostName, isHost, players, roomName } from '../GameState';
  import { navigateTo, View } from '../Navigator';

  function startGame() {
    const startGameAction = new Actions.StartGame();
    ClientWebsocket.sendAction(startGameAction);
    ClientWebsocket.removeActionListener(ActionEnum.START_GAME);
    navigateTo(View.GAME);
  }
  ClientWebsocket.addActionListener(ActionEnum.START_GAME, startGame);
</script>

<div class="container">
  <div class="lobby-card">
    <h3>Room: {$roomName}</h3>
    <h1>Lobby</h1>
    {#if $isHost}
      <p>You are the host!</p>
      {#if $players.length <= 1}
        <p>You need one more player to start.</p>
      {:else}
        <p>Start the game whenever you are ready</p>
        <button on:click={startGame}> Start Game </button>
      {/if}
    {:else}
      <p>Waiting on {$hostName} to start the game</p>
    {/if}
    <h2>Players:</h2>
    <ul class="player-list">
      {#each $players as player}
        <li>{player}</li>
      {/each}
    </ul>
  </div>
</div>

<style>
  .container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
  }
  .lobby-card {
    background-color: var(--paper-white);
    padding: 2.5rem;
    border-radius: 0.25rem;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
    transform: rotate(1deg);
    width: 100%;
    max-width: 30rem;
    text-align: center;
  }
  h1 {
    color: var(--pen-red);
    margin-bottom: 0.5rem;
  }
  h2 {
    color: var(--pen-blue);
    margin-top: 2rem;
    margin-bottom: 1rem;
  }
  h3 {
    color: var(--pen-black);
    margin-bottom: 1.5rem;
  }
  .player-list {
    list-style-type: '✏️';
    padding-left: 2rem;
    margin-bottom: 2rem;
    text-align: left;
  }
  li {
    padding: 0.8rem;
    margin-bottom: 0.8rem;
  }
</style>
