import { Player, Host } from "./Player";

class Room {
    name: string;
    host: Host;
    players: Player[];

    constructor(name: string, host: Player) {
        this.name = name;
        this.host = host;
        this.players = [host];
    }

    addPlayer(player: Player): void {
        this.players.push(player);
    }
}

export default Room;