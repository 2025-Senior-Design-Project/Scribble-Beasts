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

<div class="container">
  <form>
    <div class="form-group">
      <label for="roomName">Room</label>
      <input
        type="text"
        id="roomName"
        bind:value={roomName}
        placeholder="Enter Room Name"
        required
      />
      <div class="error-text">{roomNameError}</div>
    </div>
    <div class="form-group">
      <label for="playerName">Name</label>
      <input
        type="text"
        id="playerName"
        bind:value={playerName}
        placeholder="Enter Your Player Name"
        required
      />
      <div class="error-text">{playerNameError}</div>
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
  .container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
  }
  form {
    background-color: var(--paper-white);
    padding: 2.5rem;
    border-radius: 0.25rem;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
    transform: rotate(-2deg);
    width: 100%;
    max-width: 25rem;
  }
  .form-group {
    margin-bottom: 1.5rem;
  }
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 1.1rem;
    color: var(--pen-blue);
  }
  input {
    width: 100%;
    padding: 0.8rem;
    background-color: transparent;
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
  .error-text {
    color: var(--pen-red);
    font-size: 0.9em;
    height: 1.2em;
    margin-top: 0.25rem;
  }
</style>
