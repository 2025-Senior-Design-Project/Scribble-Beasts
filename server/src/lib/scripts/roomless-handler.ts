import WebSocket from "ws";
import Room from "../components/Room";
import { Actions, ActionType, ParseAction, type AnyAction } from "@shared/actions";
import { Player, Host } from "../components/Player";

const Rooms: Room[] = [];

export function handleNewConnection(ws: WebSocket) {
    console.log('New WebSocket connection');

    ws.on('error', console.error);

    ws.on('message', function message(data) {
        const action = ParseAction<AnyAction>(data.toString());
        if (!action) return;

        switch (action.type) {
            case ActionType.CREATE_ROOM: {
                const { roomName, hostName } = action.payload;
                let hostInputMessage: string | undefined;
                let roomInputMessage: string | undefined;

                if (!hostName?.trim()) { // "" or undefined
                    hostInputMessage = "Name cannot be empty.";
                }
                if (!roomName?.trim()) {
                    roomInputMessage = "Room name cannot be empty.";
                    if (hostInputMessage) {
                        ws.send(
                            JSON.stringify(
                                new Actions.RoomError(
                                    hostInputMessage,
                                    roomInputMessage
                                )
                            )
                        );
                        return;
                    }
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

                if (!playerName?.trim()) { // "" or undefined
                    nameInputMessage = "Name cannot be empty.";
                }
                if (!roomName?.trim()) {
                    roomInputMessage = "Room name cannot be empty.";
                    if (nameInputMessage) {
                        ws.send(
                            JSON.stringify(
                                new Actions.RoomError(
                                    nameInputMessage,
                                    roomInputMessage
                                )
                            )
                        );
                    }
                    return;
                }

                const room = findRoom(roomName);
                if (!room) {
                    roomInputMessage = "Room does not exist.";
                }

                if (room && playerExistsInRoom(room, playerName)) {
                    nameInputMessage = "Name already taken in this room.";
                }

                if (!room || nameInputMessage || roomInputMessage) {
                    ws.send(
                        JSON.stringify(
                            new Actions.RoomError(nameInputMessage, roomInputMessage)
                        )
                    );
                    return;
                }

                room.addPlayer(new Player(playerName, ws));
                ws.send(JSON.stringify(new Actions.JoinRoom(roomName, playerName)));
                console.log(`Player ${playerName} joined room ${roomName}`);
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