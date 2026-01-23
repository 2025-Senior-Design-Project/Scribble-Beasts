<script lang="ts">
  import ClientWebsocket from '../ClientWebsocket';
  let message: string = $state('');
  let showMessage: boolean = $state(false);

  if (process.env.NODE_ENV === 'development') {
    ClientWebsocket.addEventListener('error', (event) => {
      message +=
        'Error! Send in a bug report!\n' + JSON.stringify(event) + '\n';
      showMessage = true;
    });

    ClientWebsocket.addEventListener('close', (event) => {
      if (event.code === 1000) return;
      message +=
        "Can't connect to server, try refreshing the page (server might be down)." +
        '\n';
      showMessage = true;
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
    z-index: 9999;
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
