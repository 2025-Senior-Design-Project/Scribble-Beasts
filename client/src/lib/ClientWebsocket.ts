import {
  Actions,
  ActionEnum,
  ActionTarget,
  ReconnectAction,
  type AnyAction,
} from '@shared/actions';

class CWebsocket extends ActionTarget<WebSocket, MessageEvent<string>> {
  #ws: WebSocket;
  #listeners: { type: string; listener: (ev: any) => void }[] = [];

  constructor(ws: WebSocket) {
    super(ws);
    this.#ws = ws;

    this.#attachEventListeners();

    this.addActionListener(ActionEnum.RECONNECT, (action: ReconnectAction) => {
      setCookie('playerId', action.payload.playerId, 7);
    });
  }

  getWebsocket() {
    return this.#ws;
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
      const playerId = getCookie('playerId');
      if (playerId) {
        this.#ws.send(JSON.stringify(new Actions.Reconnect(playerId)));
      }
    };

    this.#ws.onclose = (event) => {
      console.log('WebSocket connection closed. Code:', event.code);
      if (event.code === 4001) {
        console.error('Invalid Session. Clearing cookie and stopping.');
        setCookie('playerId', '', -1);
        if (instance) {
          instance.destroy();
          instance = null;
        }
        return;
      }

      console.log('Attempting to reconnect...');
      setTimeout(() => {
        this.reconnect();
      }, 1000);
    };
  }

  addEventListener(type: string, listener: (ev: any) => void): void {
    super.addEventListener(type, listener);
    this.#listeners.push({ type, listener });
  }

  removeEventListener(type: string, listener: (ev: any) => void): void {
    super.removeEventListener(type, listener);
    this.#listeners = this.#listeners.filter(
      (l) => l.type !== type || l.listener !== listener,
    );
  }

  destroy() {
    this.#listeners.forEach((l) => {
      this.#ws.removeEventListener(l.type, l.listener);
    });
    this.#listeners = [];

    this.#ws.onclose = null; // Prevent reconnect
    this.#ws.close(1000, 'Normal Closure');
    super.destroy();
  }
}

// Global instance management
let instance: CWebsocket | null = null;
const bufferedListeners: {
  actionType: ActionEnum;
  listener: (action: any) => void;
  cleanup: (() => void) | null;
}[] = [];

const bufferedEventListeners: {
  type: string;
  listener: (ev: any) => void;
}[] = [];

function getWebsocketUrl() {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}/api`;
}

function initClientWebsocket() {
  if (instance) return;

  const wsUrl = getWebsocketUrl();
  const ws = new WebSocket(wsUrl);
  instance = new CWebsocket(ws);

  // Apply buffered action listeners
  bufferedListeners.forEach((item) => {
    item.cleanup = instance!.addActionListener(item.actionType, item.listener);
  });

  // Apply buffered event listeners
  bufferedEventListeners.forEach((item) => {
    instance!.addEventListener(item.type, item.listener);
  });
}

function setCookie(name: string, value: string, days: number) {
  let expires = '';
  if (days) {
    if (days <= 0) {
      expires = '; Max-Age=0';
    } else {
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = '; expires=' + date.toUTCString();
    }
  }
  document.cookie = name + '=' + (value || '') + expires + '; path=/';
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

// Proxy object
const ClientWebsocketProxy = {
  isConnected() {
    return !!instance && instance.getWebsocket().readyState === WebSocket.OPEN;
  },

  connect() {
    initClientWebsocket();
  },

  sendAction(action: object) {
    if (instance) {
      instance.sendAction(action);
    } else {
      console.warn('WebSocket not connected. Action dropped:', action);
    }
  },

  addActionListener<A extends AnyAction>(
    actionType: ActionEnum,
    listener: (action: A) => void,
  ): () => void {
    if (instance) {
      return instance.addActionListener(actionType, listener);
    }

    // Buffer
    const item = {
      actionType,
      listener: listener as (action: any) => void,
      realUnsubscribe: null as (() => void) | null,
    };

    // We need to store this item so we can apply it later
    // But we can't push to simple array if we want to remove specific one.
    // Let's use an array and filter on remove.
    // Wait, we need to know WHICH item to remove. `item` reference.

    // Simplified buffering: just store the call arguments.
    // When init, call them.
    // Return a function that removes from buffer OR calls real unsubscribe.

    // Better: define a wrapper for the listener?

    const bufferEntry = {
      actionType,
      listener,
      cleanup: null as (() => void) | null,
    };

    // We need to access this buffer in init
    // Let's move buffer to module scope (done above)
    // But Typescript might complain about types.

    // Let's just use a custom list.
    const entry = {
      actionType,
      listener: listener as (action: any) => void,
      cleanup: null as (() => void) | null,
    };
    bufferedListeners.push(entry);

    return () => {
      if (entry.cleanup) {
        entry.cleanup();
      }
      // Remove from buffer
      const idx = bufferedListeners.indexOf(entry);
      if (idx !== -1) {
        bufferedListeners.splice(idx, 1);
      }
    };
  },

  removeActionListener(actionType: ActionEnum) {
    if (instance) {
      instance.removeActionListener(actionType);
    }
    for (let i = bufferedListeners.length - 1; i >= 0; i--) {
      if (bufferedListeners[i].actionType === actionType) {
        bufferedListeners.splice(i, 1);
      }
    }
  },

  addEventListener(type: string, listener: (ev: any) => void) {
    if (instance) {
      instance.addEventListener(type, listener);
    }
    bufferedEventListeners.push({ type, listener });
  },

  removeEventListener(type: string, listener: (ev: any) => void) {
    if (instance) {
      instance.removeEventListener(type, listener);
    }
    for (let i = bufferedEventListeners.length - 1; i >= 0; i--) {
      if (
        bufferedEventListeners[i].type === type &&
        bufferedEventListeners[i].listener === listener
      ) {
        bufferedEventListeners.splice(i, 1);
      }
    }
  },

  destroy() {
    if (instance) {
      instance.destroy();
      instance = null;
    }
  },

  setCookie,
  getCookie,
};

export default ClientWebsocketProxy;
