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

<div>
  <form>
    <label for="roomName">Room</label>
    <input
      type="text"
      id="roomName"
      bind:value={roomName}
      placeholder="Enter Room Name"
      required
    />
    <div class="error-text">{roomNameError}</div>
    <label for="roomName">Name</label>
    <input
      type="text"
      bind:value={playerName}
      placeholder="Enter Your Player Name"
      required
    />
    <div class="error-text">{playerNameError}</div>
    <button
      id="joinRoom"
      type="submit"
      onclick={joinRoom}
      disabled={!inputsFilled}
      class="mt-2 bg-blue-500 text-white p-2 rounded w-full"
    >
      Join Room
    </button>
    <button
      id="createRoom"
      type="submit"
      onclick={createRoom}
      disabled={!inputsFilled}
      class="mt-2 bg-blue-500 text-white p-2 rounded w-full"
    >
      Create Room
    </button>
  </form>
</div>

<style>
  form {
    display: flex;
    flex-direction: column;
    width: 15em;
    margin: auto;
  }
  input {
    padding: 0.7em;
    border: 1px solid #ccc;
    border-radius: 0.5em;
  }
  button {
    padding: 0.5em;
    cursor: pointer;
  }
  button:disabled {
    cursor: not-allowed;
  }
  input,
  button {
    margin-bottom: 1em;
  }
  .error-text {
    color: red;
    font-size: 0.8em;
    height: 1em;
    margin-top: -0.75em;
    margin-bottom: 0.75em;
  }
</style>
