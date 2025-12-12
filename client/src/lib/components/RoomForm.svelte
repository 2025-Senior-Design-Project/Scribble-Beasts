<script lang="ts">
  import {
    Actions,
    ActionEnum,
    type RoomErrorAction,
    type CreateRoomAction,
    type JoinRoomAction,
  } from '@shared/actions';
  import ClientWebsocket from '../ClientWebsocket';
  import {
    isHost,
    roomName as roomNameState,
    hostName as hostNameState,
    playerName as playerNameState,
  } from '../GameState';
  import { navigateTo, View } from '../Navigator';

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
    ClientWebsocket.removeActionListener(ActionEnum.ROOM_ERROR);
    ClientWebsocket.removeActionListener(ActionEnum.CREATE_ROOM);
    ClientWebsocket.removeActionListener(ActionEnum.JOIN_ROOM);
  }

  ClientWebsocket.addActionListener<RoomErrorAction>(
    ActionEnum.ROOM_ERROR,
    (action) => {
      clearErrors();
      const { roomInputMessage, nameInputMessage } = action.payload;
      roomNameError = roomInputMessage ?? '';
      playerNameError = nameInputMessage ?? '';
    }
  );
  ClientWebsocket.addActionListener<CreateRoomAction>(
    ActionEnum.CREATE_ROOM,
    (action) => {
      cleanupRoomForm();
      const { hostName, roomName } = action.payload;
      isHost.set(true);
      hostNameState.set(hostName);
      playerNameState.set(hostName);
      roomNameState.set(roomName);
      navigateTo(View.LOBBY);
    }
  );
  ClientWebsocket.addActionListener<JoinRoomAction>(
    ActionEnum.JOIN_ROOM,
    (action) => {
      cleanupRoomForm();
      const { playerName, roomName, hostName } = action.payload;
      isHost.set(false);
      hostNameState.set(hostName);
      playerNameState.set(playerName);
      roomNameState.set(roomName);
      navigateTo(View.LOBBY);
    }
  );

  const inputsFilled = $derived(
    roomName.trim() !== '' && playerName.trim() !== ''
  );

  function joinRoom(event: Event): void {
    event.preventDefault();
    const joinRoomAction = new Actions.JoinRoom(roomName, playerName);
    ClientWebsocket.sendAction(joinRoomAction);
  }
  function createRoom(event: Event): void {
    event.preventDefault();
    const createRoomAction = new Actions.CreateRoom(roomName, playerName);
    ClientWebsocket.sendAction(createRoomAction);
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
  .room-form {
    transform: rotate(-2deg);
    max-width: 25rem;
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
    width: 100%;
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
