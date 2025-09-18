import WebSocket from "ws";
import Room from "../components/Room";
import { Actions, ActionType, type AnyAction } from "@shared/actions/index";
import { Player, Host } from "../components/Player";

const Rooms: Room[] = [];

export function handleNewConnection(ws: WebSocket) {
    console.log('New WebSocket connection');

    ws.on('error', console.error);

    ws.on('message', function message(data) {
        let action: AnyAction;

        try {
            // check that data has the structure of an Action
            const parsedAction = JSON.parse(data.toString()) as AnyAction;
            if (!parsedAction || // null, undefined, etc.
                typeof parsedAction !== "object" || // not an object
                typeof parsedAction.type !== "string" || // missing or invalid value for type
                !("payload" in parsedAction) // missing payload (can be any type)
            ) {
                console.error("Non-action from client. Received: ", parsedAction);
                return;
            }

            action = parsedAction;
        } catch (e) {
            console.error("Non-JSON from client. Received: ", data.toString());
            return;
        }

        switch (action.type) {
            case ActionType.CREATE_ROOM: {
                const { roomName, hostName } = action.payload;
                let hostInputMessage: string | undefined;

                if (hostName?.trim()) { // "" or undefined
                    hostInputMessage = "Name cannot be empty.";
                }
                if (roomName?.trim() && hostInputMessage) {
                    ws.send(
                        JSON.stringify(
                            new Actions.RoomError(
                                hostInputMessage,
                                "Room name cannot be empty."
                            )
                        )
                    );
                    return;
                }

                if (findRoom(roomName)) {
                    ws.send(
                        JSON.stringify(
                            new Actions.RoomError(hostInputMessage, "Room name already taken.")
                        )
                    );
                    return;
                }

                const newRoom = new Room(roomName, new Host(hostName, ws));
                Rooms.push(newRoom);
                ws.send(JSON.stringify(new Actions.CreateRoom(roomName, hostName)));
                console.log(`Room ${roomName} created with host ${hostName}`);
            } break;

            case ActionType.JOIN_ROOM: {
                const { roomName, playerName } = action.payload;
                let nameInputMessage: string | undefined;
                let roomInputMessage: string | undefined;

                if (playerName?.trim()) { // "" or undefined
                    nameInputMessage = "Name cannot be empty.";
                }
                if (roomName?.trim() && nameInputMessage) {
                    ws.send(
                        JSON.stringify(
                            new Actions.RoomError(
                                nameInputMessage,
                                "Room name cannot be empty."
                            )
                        )
                    );
                    return;
                }

                const room = findRoom(roomName);
                if (!room) {
                    nameInputMessage = "Room does not exist.";
                    return;
                }

                if (playerExistsInRoom(room, playerName)) {
                    roomInputMessage = "Name already taken in this room.";
                    return;
                }

                if (nameInputMessage || roomInputMessage) {
                    ws.send(
                        JSON.stringify(
                            new Actions.RoomError(nameInputMessage, roomInputMessage)
                        )
                    );
                    return;
                }

                room.addPlayer(new Player(playerName, ws));
                ws.send(JSON.stringify(new Actions.JoinRoom(roomName, playerName)));
                console.log(`Player ${playerName} joined room ${roomInputMessage}`);
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