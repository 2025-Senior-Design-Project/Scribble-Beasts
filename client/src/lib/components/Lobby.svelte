<script lang="ts">
  import { Actions } from '@shared/actions';
  import ClientWebsocket from '../ClientWebsocket';
  import { hostName, isHost, players, roomName } from '../GameState';
  import { navigateTo, View } from '../Navigator';
  // TODO add host change support if host disconnects

  function startGame() {
    const startGameAction = new Actions.StartGame();
    ClientWebsocket.sendAction(startGameAction);
    navigateTo(View.GAME);
  }
</script>

<div>
  <h3>Room {$roomName}</h3>
  <h1>Lobby</h1>
  {#if $isHost}
    <p>You are the host! Start the game whenever you are ready</p>
    <button on:click={startGame}> Start Game </button>
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
