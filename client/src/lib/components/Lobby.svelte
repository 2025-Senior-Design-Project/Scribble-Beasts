<script lang="ts">
  import { Actions, ActionEnum } from '@shared/actions';
  import ClientWebsocket from '../ClientWebsocket';
  import { hostName, isHost, players, roomName } from '../GameState';
  import { navigateTo, View } from '../Navigator';
  import { onMount } from 'svelte';

  let starting = $state(false);
  let connected = $state(false);

  onMount(() => {
    const interval = setInterval(() => {
      connected = ClientWebsocket.isConnected();
    }, 500);
    return () => clearInterval(interval);
  });

  function startGame() {
    console.log('Lobby: startGame called. isHost:', $isHost);
    starting = true;
    if ($isHost) {
      const startGameAction = new Actions.StartGame();
      ClientWebsocket.sendAction(startGameAction);
    }
    ClientWebsocket.removeActionListener(ActionEnum.START_GAME);
    navigateTo(View.GAME);
  }
  ClientWebsocket.addActionListener(ActionEnum.START_GAME, startGame);
</script>

<div class="flex-center-page">
  <div class="paper-card lobby-card">
    <h3>Room: {$roomName}</h3>
    <h1 class="text-pen-red">Lobby</h1>
    {#if $isHost}
      <p>You are the host!</p>
      {#if $players.length <= 1}
        <p>You need one more player to start.</p>
      {:else}
        <p>Start the game whenever you are ready</p>
        <button onclick={startGame} disabled={starting || !connected}>
          {#if starting}
            Starting...
          {:else if !connected}
            Connecting...
          {:else}
            Start Game
          {/if}
        </button>
      {/if}
    {:else}
      <p>Waiting on {$hostName} to start the game</p>
    {/if}
    <h2 class="text-pen-blue">Players:</h2>
    <ul class="player-list">
      {#each $players as player}
        <li>{player}</li>
      {/each}
    </ul>
  </div>
</div>

<style>
  .lobby-card {
    transform: rotate(1deg);
    max-width: 30rem;
  }
  h1 {
    margin-bottom: 0.5rem;
  }
  h2 {
    margin-top: 2rem;
    margin-bottom: 1rem;
  }
  h3 {
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
