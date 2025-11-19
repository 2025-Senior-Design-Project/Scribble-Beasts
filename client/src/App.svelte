<script lang="ts">
  import ClientWebsocket from './lib/ClientWebsocket';
  import { Actions } from '@shared/actions';
  import ErrorToast from './lib/components/ErrorToast.svelte';
  import RoomForm from './lib/components/RoomForm.svelte';
  import Lobby from './lib/components/Lobby.svelte';
  import Game from './lib/components/Game.svelte';
  import { View, currentView, navigateTo } from './lib/Navigator';
  import { resetState } from './lib/GameState';

  resetState();

  function leaveRoom() {
    ClientWebsocket.sendAction(new Actions.LeaveRoom());
    navigateTo(View.ROOM_FORM);
  }
</script>

<main>
  <ErrorToast />
  {#if $currentView !== View.ROOM_FORM}
    <button class="leave-room" on:click={leaveRoom}>Leave Room</button>
  {/if}
  {#if $currentView === View.ROOM_FORM}
    <RoomForm />
  {:else if $currentView === View.LOBBY}
    <Lobby />
  {:else if $currentView === View.GAME}
    <Game />
  {/if}
</main>

<style>
  .leave-room {
    position: absolute;
    bottom: 1rem;
    right: 1rem;
    background-color: #ff0000;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    cursor: pointer;
  }
</style>
