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
      // Use sessionStorage so each tab keeps its own playerId
      sessionStorage.setItem('playerId', action.payload.playerId);
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
      const playerId = sessionStorage.getItem('playerId');
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
}

const ClientWebsocket = new CWebsocket();
export default ClientWebsocket;

function getWebsocketUrl(): string {
  const serverUrl = import.meta.env.VITE_SERVER_URL;
  // If serverUrl is undefined, we fallback to relative /api path (Local/Playtest)

  const urlStr = serverUrl || window.location.origin + '/api';
  const url = new URL(urlStr);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';

  const playerId = sessionStorage.getItem('playerId');
  if (playerId) {
    url.searchParams.set('playerId', playerId);
  }

  return url.toString();
}
