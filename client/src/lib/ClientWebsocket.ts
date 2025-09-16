
class CWebsocket {
    #ws: WebSocket;

    constructor() {
        // Use relative URL to automatically match the current host
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/api`;
        this.#ws = new WebSocket(wsUrl);

        this.#ws.onerror = (event) => {
            console.error("WebSocket error:", event);
        };

        this.#ws.onopen = () => {
            console.log("WebSocket connection established");
        };

        this.#ws.onmessage = (event: MessageEvent<string>) => {
            alert(event.data);
        };
    }

    sendMessage(msg: string): void {
        if (this.#ws.readyState === WebSocket.OPEN) {
            this.#ws.send(msg);
        } else {
            console.error(
                "WebSocket is not open. Ready state:",
                this.#ws.readyState
            );
        }
    }

    $destroy() {
        this.#ws.close();
    }
}

const ClientWebsocket = new CWebsocket();
export default ClientWebsocket;