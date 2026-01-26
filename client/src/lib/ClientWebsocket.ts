import {
  Actions,
  ActionEnum,
  ActionTarget,
  ReconnectAction,
} from '@shared/actions';

class CWebsocket extends ActionTarget<WebSocket, MessageEvent<string>> {
  #ws: WebSocket;

  constructor() {
    const wsUrl = getWebsocketUrl();
    const ws = new WebSocket(wsUrl);
    super(ws);
    this.#ws = ws;

    this.#attachEventListeners();

    this.addActionListener(ActionEnum.RECONNECT, (action: ReconnectAction) => {
      this.setCookie('playerId', action.payload.playerId, 7);
    });
  }

  reconnect() {
    const wsUrl = getWebsocketUrl();
    const ws = new WebSocket(wsUrl);
    this.setWebsocket(ws);
    this.#ws = ws;
    this.#attachEventListeners();
  }

  #attachEventListeners() {
    this.#ws.onerror = (event) => {
      console.error('WebSocket error:', event);
    };

    this.#ws.onopen = () => {
      console.log('WebSocket connection established');
      const playerId = this.getCookie('playerId');
      if (playerId) {
        this.#ws.send(JSON.stringify(new Actions.Reconnect(playerId)));
      }
    };

    this.#ws.onclose = () => {
      console.log('WebSocket connection closed. Attempting to reconnect...');
      setTimeout(() => {
        this.reconnect();
      }, 1000);
    };
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

  getCookie(name: string): string | null {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }
}

const ClientWebsocket = new CWebsocket();
export default ClientWebsocket;

function getWebsocketUrl(): string {
  const serverUrl = import.meta.env.VITE_SERVER_URL;
  // If serverUrl is undefined, we fallback to relative /api path (Local/Playtest)

  const urlStr = serverUrl || window.location.origin + '/api';
  const url = new URL(urlStr);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';

  const playerId = getCookie('playerId');
  if (playerId) {
    url.searchParams.set('playerId', playerId);
  }

  return url.toString();
}

function getCookie(name: string): string | null {
  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}
