import WebSocket from "ws";
import Actions, { Action } from "../components/Action.js";
import Room from "../components/Room.js";

const Rooms: Room[] = [];

export function handleNewConnection(ws: WebSocket) {
    console.log('New WebSocket connection');
    ws.on('error', console.error);

    ws.on('message', function message(data) {
        let action: Action;
        try {
            const parsedAction = JSON.parse(data.toString()) as Action;

            // Check if it's actually an instance of Action
            if (!(parsedAction instanceof Action)) {
                console.error("Non-action from client. Received: ", parsedAction);
                return;
            }

            action = parsedAction;
        }
        catch (e) {
            console.error("Non-JSON from client. Received: ", data.toString());
            return;
        }

        switch (action.type) {
            case Actions.CreateRoom.name:
                {
                    const { roomName, hostName } = action.payload;
                    if (findRoom(roomName)) {
                        ws.send(
                            JSON.stringify(
                                new Actions.RoomError(undefined, "Room name already taken.")
                            ));
                        return;
                    }
                    const newRoom = new Room(roomName, hostName);
                    Rooms.push(newRoom);
                    console.log(`Room ${roomName} created with host ${hostName}`);
                } break;
            case Actions.JoinRoom.name:
                {
                    const { roomName, userName } = action.payload;
                    const room = findRoom(roomName);
                    let nameInputMessage, roomInputMessage: string | undefined = undefined;
                    if (!room) {
                        nameInputMessage = "Room does not exist.";
                        return;
                    }
                    if (playerExistsInRoom(room, userName)) {
                        roomInputMessage = "Name already taken in this room.";
                        return;
                    }
                    if (nameInputMessage || roomInputMessage) {
                        ws.send(
                            JSON.stringify(
                                new Actions.RoomError(nameInputMessage, roomInputMessage)
                            ));
                        return;
                    }
                    room.addPlayer(userName);
                    console.log(`Player ${userName} joined room ${roomInputMessage}`);
                } break;
        }
    });
}

function findRoom(roomName: string): Room | undefined {
    return Rooms.find(room => room.name === roomName);
}

function playerExistsInRoom(room: Room, playerName: string): boolean {
    return room.players.some(player => player.name === playerName);
}