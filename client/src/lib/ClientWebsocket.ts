import { ActionEnum, ActionTarget, ReconnectAction } from '@shared/actions';

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

    this.#ws.onclose = () => {
      console.log('WebSocket connection closed. Attempting to reconnect...');
      setTimeout(() => {
        this.reconnect();
      }, 1000);
    };

    this.addActionListener(ActionEnum.RECONNECT, (action: ReconnectAction) => {
      this.setCookie('playerId', action.payload.playerId, 7);
    });
  }

  reconnect() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api`;
    const ws = new WebSocket(wsUrl);
    this.setWebsocket(ws);
    this.#ws = ws;
  }

  setCookie(name: string, value: string, days: number) {
    let expires = '';
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = '; expires=' + date.toUTCString();
    }
    document.cookie = name + '=' + (value || '') + expires + '; path=/';
  }
}

const ClientWebsocket = new CWebsocket();
export default ClientWebsocket;
