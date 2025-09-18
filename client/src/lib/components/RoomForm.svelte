<script lang="ts">
  import {
    Actions,
    ParseAction,
    ActionType,
    type RoomErrorAction,
    type CreateRoomAction,
    type JoinRoomAction,
  } from "@shared/actions";
  import ClientWebsocket from "../ClientWebsocket";

  let roomName: string = $state("");
  let roomNameError: string = $state("");
  let playerName: string = $state("");
  let playerNameError: string = $state("");

  function clearErrors() {
    roomNameError = "";
    playerNameError = "";
  }

  ClientWebsocket.addEventListener("message", (event: MessageEvent<string>) => {
    const action = ParseAction<
      RoomErrorAction | CreateRoomAction | JoinRoomAction
    >(event.data);
    if (!action) return;
    switch (action?.type) {
      case ActionType.ROOM_ERROR:
        const { roomInputMessage, nameInputMessage } = action.payload;
        clearErrors();
        roomNameError = roomInputMessage ?? "";
        playerNameError = nameInputMessage ?? "";
        break;
      case ActionType.CREATE_ROOM:
        alert("Room created successfully!"); //TODO: move to lobby
        clearErrors();
        break;
      case ActionType.JOIN_ROOM:
        alert("Joined room successfully!"); //TODO: move to lobby
        clearErrors();
        break;
      default:
        console.log("Received unexpected action on RoomForm:", event.data);
        clearErrors();
        return;
    }
  });

  const inputsFilled = $derived(
    roomName.trim() !== "" && playerName.trim() !== ""
  );

  function joinRoom(event: Event): void {
    event.preventDefault();
    const joinRoomAction = new Actions.JoinRoom(roomName, playerName);
    ClientWebsocket.sendMessage(JSON.stringify(joinRoomAction));
  }
  function createRoom(event: Event): void {
    event.preventDefault();
    const createRoomAction = new Actions.CreateRoom(roomName, playerName);
    ClientWebsocket.sendMessage(JSON.stringify(createRoomAction));
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
