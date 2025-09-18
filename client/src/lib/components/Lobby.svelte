<script lang="ts">
  const isHost: boolean = $state(false);
  const hostName: string = $state("");
  const roomCode: string = $state("");

  // TODO add host change support if host disconnects
</script>

<div>
  <h3>Room {roomCode}</h3>
  <h1>Lobby</h1>
  {#if isHost}
    <p>You are the host! Start the game whenever you are ready</p>
  {:else if roomCode}
    <p>Waiting on {hostName} to start the game</p>
  {/if}
</div>
