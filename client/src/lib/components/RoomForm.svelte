<script lang="ts">
  import { Actions } from "@shared/actions";
  import ClientWebsocket from "../ClientWebsocket";

  let roomName: string = $state("");
  let playerName: string = $state("");

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
    <label for="roomName">Name</label>
    <input
      type="text"
      bind:value={playerName}
      placeholder="Enter Your Player Name"
      required
    />
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
</style>
