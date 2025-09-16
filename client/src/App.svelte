<script lang="ts">
  import ClientWebsocket from "./lib/ClientWebsocket";

  function handleClick(): void {
    ClientWebsocket.sendMessage("ping");
  }
</script>

<main>
  <h1>Hello World!</h1>
  <br />
  <button on:click={handleClick}>Ping</button>
</main>

<style>
  main {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    margin: 0;
    font-family: Arial, sans-serif;
  }

  h1 {
    color: #333;
    font-size: 2.5rem;
  }
</style>
