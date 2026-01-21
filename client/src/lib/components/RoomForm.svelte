<script lang="ts">
  import { ActionEnum, type RoomJoinedAction } from '@shared/actions';
  import ClientWebsocket from '../ClientWebsocket';
  import {
    isHost,
    roomName as roomNameState,
    hostName as hostNameState,
    playerName as playerNameState,
  } from '../GameState';
  import { navigateTo, View } from '../Navigator';
  import { jumpToRound } from '../stores/roundStore';

  let roomName: string = $state('');
  let roomNameError: string = $state('');
  let playerName: string = $state('');
  let playerNameError: string = $state('');

  function clearErrors() {
    roomNameError = '';
    playerNameError = '';
  }

  function cleanupRoomForm() {
    clearErrors();
    ClientWebsocket.removeActionListener(ActionEnum.ROOM_JOINED);
  }

  ClientWebsocket.addActionListener<RoomJoinedAction>(
    ActionEnum.ROOM_JOINED,
    (action) => {
      cleanupRoomForm();
      const {
        playerName: pName,
        roomName: rName,
        hostName: hName,
        currentRound,
        timer,
      } = action.payload;
      isHost.set(pName === hName);
      hostNameState.set(hName);
      playerNameState.set(pName);
      roomNameState.set(rName);

      if (currentRound !== undefined && timer !== undefined) {
        jumpToRound(currentRound, timer);
        navigateTo(View.GAME);
      } else {
        navigateTo(View.LOBBY);
      }
    },
  );

  const inputsFilled = $derived(
    roomName.trim() !== '' && playerName.trim() !== '',
  );

  async function handleApiError(response: Response) {
    try {
      const data = await response.json();
      if (data.nameInputMessage) playerNameError = data.nameInputMessage;
      if (data.roomInputMessage) roomNameError = data.roomInputMessage;
    } catch (e) {
      console.error('Failed to parse error response', e);
    }
  }

  async function handleApiSuccess(response: Response) {
    try {
      const data = await response.json();
      ClientWebsocket.setCookie('playerId', data.playerId, 7);
      ClientWebsocket.connect();
      // Navigation happens via ROOM_JOINED listener
    } catch (e) {
      console.error('Failed to parse success response', e);
    }
  }

  async function joinRoom(event: Event) {
    event.preventDefault();
    clearErrors();
    try {
      const res = await fetch('/api/room/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName, playerName }),
      });
      if (res.ok) {
        await handleApiSuccess(res);
      } else {
        await handleApiError(res);
      }
    } catch (e) {
      console.error('API call failed', e);
    }
  }

  async function createRoom(event: Event) {
    event.preventDefault();
    clearErrors();
    try {
      const res = await fetch('/api/room/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName, hostName: playerName }),
      });
      if (res.ok) {
        await handleApiSuccess(res);
      } else {
        await handleApiError(res);
      }
    } catch (e) {
      console.error('API call failed', e);
    }
  }
</script>

<div class="flex-center-page">
  <form class="paper-card room-form">
    <div class="form-group">
      <label for="roomName" class="text-pen-blue">Room</label>
      <input
        type="text"
        id="roomName"
        bind:value={roomName}
        placeholder="Enter Room Name"
        required
      />
      <div class="text-error">{roomNameError}</div>
    </div>
    <div class="form-group">
      <label for="playerName" class="text-pen-blue">Name</label>
      <input
        type="text"
        id="playerName"
        bind:value={playerName}
        placeholder="Enter Your Player Name"
        required
      />
      <div class="text-error">{playerNameError}</div>
    </div>
    <div class="button-group">
      <button
        id="joinRoom"
        type="submit"
        onclick={joinRoom}
        disabled={!inputsFilled}
      >
        Join Room
      </button>
      <button
        id="createRoom"
        type="submit"
        onclick={createRoom}
        disabled={!inputsFilled}
      >
        Create Room
      </button>
    </div>
  </form>
</div>

<style>
  div {
    display: contents;
  }
  .room-form {
    transform: rotate(-2deg);
    max-width: 25rem;
    /* Styles are now handled by parent wrapper or shared */
    width: 100%;
    /* max-width: 25rem; This will be controlled by parent */
    padding-top: 4rem;
  }
  .form-group {
    margin-bottom: 1.5rem;
  }
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-size: var(--text-lg);
    text-align: left;
  }
  input {
    width: 90%;
    padding-left: 1rem;
    /* padding inherited from global but 100% width needed here */
  }
  .button-group {
    display: flex;
    gap: 1rem;
    margin-top: 1.5rem;
  }
  button {
    flex: 1;
  }
  button:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
</style>
