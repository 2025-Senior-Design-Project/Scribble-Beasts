<script lang="ts">
  import { Actions, ActionEnum, AudioMode } from '@shared/actions';
  import ClientWebsocket from '../ClientWebsocket';
  import {
    hostName,
    isHost,
    players,
    roomName,
    audioMode,
    designatedSpeaker,
  } from '../GameState';
  import { navigateTo, View } from '../Navigator';
  import { AssetManager } from '../AssetManager';
  import { onMount } from 'svelte';

  onMount(() => {
    AssetManager.preload();
  });

  function startGame() {
    const startGameAction = new Actions.StartGame();
    ClientWebsocket.sendAction(startGameAction);
    ClientWebsocket.removeActionListener(ActionEnum.START_GAME);
    navigateTo(View.GAME);
  }

  function updateAudioMode(mode: AudioMode) {
    const action = new Actions.AudioSettingsChange(mode, $designatedSpeaker);
    ClientWebsocket.sendAction(action);
  }

  function updateSpeaker(speaker: string) {
    const action = new Actions.AudioSettingsChange($audioMode, speaker);
    ClientWebsocket.sendAction(action);
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
        <button on:click={startGame}> Start Game </button>
      {/if}

      <div class="audio-settings">
        <h3 class="text-pen-blue">Audio Settings</h3>
        <div class="radio-group">
          <label>
            <input
              type="radio"
              name="audioMode"
              value={AudioMode.IN_PERSON}
              checked={$audioMode === AudioMode.IN_PERSON}
              on:change={() => updateAudioMode(AudioMode.IN_PERSON)}
            />
            In-Person
          </label>
          <label>
            <input
              type="radio"
              name="audioMode"
              value={AudioMode.REMOTE}
              checked={$audioMode === AudioMode.REMOTE}
              on:change={() => updateAudioMode(AudioMode.REMOTE)}
            />
            Remote
          </label>
        </div>

        {#if $audioMode === AudioMode.IN_PERSON}
          <div class="speaker-select">
            <label for="speaker">Speaker Device:</label>
            <select
              id="speaker"
              value={$designatedSpeaker || $hostName}
              on:change={(e) => updateSpeaker(e.currentTarget.value)}
            >
              {#each $players as player}
                <option value={player}>{player}</option>
              {/each}
            </select>
          </div>
        {/if}
      </div>
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
  .audio-settings {
    margin-top: 2rem;
    border-top: 2px dashed #ccc;
    padding-top: 1rem;
    width: 100%;
  }
  .radio-group {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 0.5rem;
  }
  .speaker-select {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }
  select {
    font-family: inherit;
    padding: 0.5rem;
    border-radius: 0.5rem;
    border: 2px solid #ccc;
  }
</style>
