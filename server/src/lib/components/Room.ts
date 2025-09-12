import Player from "./Player.js";

class Room {
    name: string;
    host: Player;
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