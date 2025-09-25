<script lang="ts">
  import ClientWebsocket from "../ClientWebsocket";
  let message: string = $state("");
  let showMessage: boolean = false;

  if (process.env.NODE_ENV === "development") {
    ClientWebsocket.addEventListener("error", (event) => {
      message +=
        "Error! Send in a bug report!\n" + JSON.stringify(event) + "\n";
      showMessage = true;

      // Hide after 5 seconds
      setTimeout(() => {
        showMessage = false;
      }, 5000);
    });

    ClientWebsocket.addEventListener("close", (event) => {
      message += "Can't connect to server, try refreshing the page." + "\n";
      showMessage = true;

      // Hide after 5 seconds
      setTimeout(() => {
        showMessage = false;
      }, 5000);
    });
  }
</script>

<div>
  <div>
    <div
      class="toast-error"
      class:toast-hidden={!showMessage}
      class:toast-visible={showMessage}
    >
      <pre class="toast-content">{message}</pre>
    </div>
  </div>
</div>

<style>
  .toast-error {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: #dc2626;
    color: white;
    padding: 16px;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    max-width: 90vw;
    transition: all 0.3s ease-out;
  }

  .toast-hidden {
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
  }

  .toast-visible {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }

  .toast-content {
    white-space: pre-wrap;
    word-break: break-word;
    margin: 0;
  }
</style>
