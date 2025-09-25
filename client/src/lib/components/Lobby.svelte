<script lang="ts">
  import { Actions, ActionType } from '@shared/actions';
  import ClientWebsocket from '../ClientWebsocket';
  import { hostName, isHost, players, roomName } from '../GameState';
  import { navigateTo, View } from '../Navigator';

  function startGame() {
    const startGameAction = new Actions.StartGame();
    ClientWebsocket.sendAction(startGameAction);
    ClientWebsocket.removeActionListener(ActionType.START_GAME);
    navigateTo(View.GAME);
  }
  ClientWebsocket.addActionListener(ActionType.START_GAME, startGame);
</script>

<div>
  <h3>Room {$roomName}</h3>
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
  <ul>
    {#each $players as player}
      <li>{player}</li>
    {/each}
  </ul>
</div>
