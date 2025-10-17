import { ActionTarget } from '@shared/actions';

class CWebsocket extends ActionTarget<WebSocket, MessageEvent<string>> {
  #ws: WebSocket;

  constructor() {
    // Use relative URL to automatically match the current host
    // this ensure only connections to nginx will work
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api`;
    const ws = new WebSocket(wsUrl);
    super(ws);
    this.#ws = ws;

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
      console.log('received:', event.data);
    });
  }
}

const ClientWebsocket = new CWebsocket();
export default ClientWebsocket;
