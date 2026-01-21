<script lang="ts">
  import ClientWebsocket from './lib/ClientWebsocket';
  import { Actions } from '@shared/actions';
  import ErrorToast from './lib/components/ErrorToast.svelte';
  import LandingPage from './lib/components/LandingPage.svelte';
  import Lobby from './lib/components/Lobby.svelte';
  import Game from './lib/components/Game.svelte';
  import ConfirmationModal from './lib/components/ConfirmationModal.svelte';
  import { View, currentView, currentPath, navigateTo } from './lib/Navigator';
  import { resetState } from './lib/GameState';

  resetState();

  let showLeaveConfirm = $state(false);

  function leaveRoom() {
    ClientWebsocket.sendAction(new Actions.LeaveRoom());
    navigateTo(View.ROOM_FORM);
  }

  // Determine if we should show the landing page based on the current view or the path
  // This allows direct URL access to /playtesting, /about, /rules
  const showLandingPage = $derived(
    $currentView === View.ROOM_FORM ||
      ['/playtesting', '/about', '/rules'].includes($currentPath),
  );

  $effect(() => {
    console.log('Current View Changed:', $currentView);
  });
</script>

<main>
  <ErrorToast />
  <ConfirmationModal
    bind:show={showLeaveConfirm}
    title="Leave Room?"
    message="Are you sure you want to leave the room?"
    onConfirm={leaveRoom}
  />
  {#if $currentView !== View.ROOM_FORM}
    <button class="leave-room" onclick={() => (showLeaveConfirm = true)}>
      Leave Room
    </button>
  {/if}
  {#if showLandingPage}
    <LandingPage />
  {:else if $currentView === View.LOBBY}
    <Lobby />
  {:else if $currentView === View.GAME}
    <Game />
  {/if}
</main>

<style>
  .leave-room {
    position: fixed;
    z-index: 999;
    top: 1rem;
    right: 1rem;
    background-color: #ff0000;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    cursor: pointer;
  }
</style>
