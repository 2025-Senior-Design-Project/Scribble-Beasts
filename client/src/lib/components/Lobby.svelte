<script lang="ts">
  import { Actions } from '@shared/actions';
  import ClientWebsocket from '../ClientWebsocket';
  import { hostName, isHost, players, roomName } from '../GameState';
  import RoomSettingsPanel from './RoomSettingsPanel.svelte';
  import { DEFAULT_ROOM_SETTINGS } from '@shared/settings';

  let showSettings = $state(false);

  function startGame() {
    ClientWebsocket.sendAction(new Actions.StartGame());
  }

  function resetRoomSettings() {
    ClientWebsocket.sendAction(
      new Actions.UpdateRoomSettings({
        ...DEFAULT_ROOM_SETTINGS,
        roundTimers: {},
      }),
    );
  }
</script>

<div class="flex-center-page">
  <div class="paper-card lobby-card">
    <div class="room-header">
      <h3>Room: {$roomName}</h3>
      <button class="settings-btn" onclick={() => (showSettings = true)}
        >⚙ Settings</button
      >
    </div>
    <h1 class="text-pen-red">Lobby</h1>
    {#if $isHost}
      <p>You are the host!</p>
      {#if $players.length <= 1}
        <p>You need one more player to start.</p>
      {:else}
        <p>Start the game whenever you are ready</p>
        <button onclick={startGame}> Start Game </button>
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

<!-- Settings modal -->
{#if showSettings}
  <div
    class="modal-backdrop"
    onclick={(e) => e.target === e.currentTarget && (showSettings = false)}
    onkeydown={(e) => e.key === 'Escape' && (showSettings = false)}
    role="dialog"
    aria-modal="true"
    aria-label="Room Settings"
    tabindex="-1"
  >
    <div class="modal-card paper-card" role="document">
      <div class="modal-header">
        <h2>Room Settings</h2>
        <div class="header-actions">
          {#if $isHost}
            <button class="reset-btn" onclick={resetRoomSettings}
              >Reset to defaults</button
            >
          {/if}
          <button class="close-btn" onclick={() => (showSettings = false)}
            >✕</button
          >
        </div>
      </div>
      <div class="modal-body">
        <RoomSettingsPanel />
      </div>
    </div>
  </div>
{/if}

<style>
  .lobby-card {
    transform: rotate(1deg);
    max-width: 30rem;
  }

  .room-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
    /* Push content clear of the paper-card dog-ear (50px corner) */
    padding-left: 2rem;
  }

  /* Override the global h3 margin since room-header handles spacing */
  .room-header h3 {
    margin: 0;
  }

  h1 {
    margin-bottom: 0.5rem;
  }
  h2 {
    margin-top: 2rem;
    margin-bottom: 1rem;
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

  .settings-btn {
    background-color: transparent;
    color: var(--pen-black);
    border: 2px solid var(--grid-blue);
    padding: 0.3rem 0.7rem;
    font-size: var(--text-sm);
    white-space: nowrap;
    flex-shrink: 0;
  }

  .settings-btn:hover {
    background-color: var(--grid-blue);
  }

  /* Modal */
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    backdrop-filter: blur(2px);
    padding: 1rem;
  }

  .modal-card {
    width: min(36rem, 100%);
    max-height: 85vh;
    display: flex;
    flex-direction: column;
    transform: rotate(-0.5deg);
    overflow: hidden;
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    /* Indent to clear the paper-card dog-ear (50px corner + card padding) */
    padding-left: 1.75rem;
    padding-bottom: 0.75rem;
    border-bottom: 2px solid var(--grid-blue);
    margin-bottom: 0.5rem;
    flex-shrink: 0;
  }

  .modal-header h2 {
    margin: 0;
    font-size: var(--text-xl);
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .reset-btn {
    background: none;
    border: 1.5px solid var(--grid-blue);
    color: var(--pen-black);
    font-size: var(--text-sm);
    padding: 0.2rem 0.6rem;
    border-radius: 0.25rem;
    cursor: pointer;
    font-family: inherit;
    opacity: 0.75;
  }

  .reset-btn:hover {
    background-color: var(--grid-blue);
    opacity: 1;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: var(--text-xl);
    cursor: pointer;
    color: var(--pen-black);
    padding: 0.2rem 0.4rem;
    line-height: 1;
  }

  .close-btn:hover {
    background: none;
    color: var(--pen-red);
  }

  .modal-body {
    overflow-y: auto;
    padding-right: 0.25rem;
  }
</style>
