class CWebsocket {
  #ws: WebSocket;

  constructor() {
    // Use relative URL to automatically match the current host
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api`;
    this.#ws = new WebSocket(wsUrl);

    this.#ws.onerror = (event) => {
      console.error('WebSocket error:', event);
    };

    this.#ws.onopen = () => {
      console.log('WebSocket connection established');
    };

    this.#ws.onmessage = (event: MessageEvent<string>) => {
      console.log(event.data);
    };

    this.addEventListener('message', (event) => {
      console.log('Received message:', event.data);
    });
  }

  addEventListener(
    type: keyof WebSocketEventMap,
    listener: (this: WebSocket, ev: MessageEvent<string>) => any
  ): void {
    this.#ws.addEventListener(type, listener as EventListener);
  }

  removeEventListener(
    type: keyof WebSocketEventMap,
    listener: (this: WebSocket, ev: MessageEvent<string>) => any
  ): void {
    this.#ws.removeEventListener(type, listener as EventListener);
  }

  sendAction(action: object): void {
    const msg = JSON.stringify(action);
    if (this.#ws.readyState === WebSocket.OPEN) {
      this.#ws.send(msg);
    } else {
      console.error('WebSocket is not open. Ready state:', this.#ws.readyState);
    }
  }
  $destroy() {
    this.#ws.close();
  }
}

const ClientWebsocket = new CWebsocket();
export default ClientWebsocket;
