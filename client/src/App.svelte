<script lang="ts">
  import ErrorToast from './lib/components/ErrorToast.svelte';
  import RoomForm from './lib/components/RoomForm.svelte';
  import Lobby from './lib/components/Lobby.svelte';
  import Game from './lib/components/Game.svelte';
  import { View, currentView } from './lib/Navigator';
</script>

<main>
  <ErrorToast />
  {#if $currentView === View.ROOM_FORM}
    <RoomForm />
  {:else if $currentView === View.LOBBY}
    <Lobby />
  {:else if $currentView === View.GAME}
    <Game />
  {/if}
</main>

<style>
</style>
