# Scribble Beasts Test Plan

## Part I. Description of Overall Test Plan

The testing strategy for "Scribble Beasts" employs a multi-layered approach to ensure reliability and user satisfaction. We will focus on three key areas: Unit Testing, Integration Testing, and Functional Testing. Unit tests will verify the logic of individual server-side components such as room management, round transitions (Scribble, Line, Color, etc.), and score calculations. Integration tests will focus on the WebSocket communication between the Client (Svelte) and Server (Node.js), ensuring that actions like joining a room, submitting a drawing, or voting are correctly propagated to all connected players in real-time.

Functional testing will be conducted to validate the end-to-end user experience, simulating real-world scenarios including room creation, game flow, and handling of edge cases like player disconnections. We will use "Blackbox" testing techniques for these functional tests, verifying inputs and outputs without reference to internal code structures, while "Whitebox" testing will be used during unit testing to ensure internal state transitions are correct. This comprehensive strategy aims to identify and resolve issues early in the development cycle.

## Part II. Test Case Descriptions

### Room Management

**TC-01: Create Room**

1. **Identifier:** TC-01
2. **Purpose:** Verify a user can create a new room and become the host.
3. **Description:** A user navigates to the landing page, enters a username and room name, and clicks "Create Room".
4. **Inputs:** Username: "HostUser", Room Name: "TestRoom".
5. **Expected Outputs:** The user is redirected to the Lobby screen, the room code is displayed, and the user is marked as the host.
6. **Indication:** Normal
7. **Type:** Blackbox
8. **Category:** Functional
9. **Level:** Integration

**TC-02: Join Room**

1. **Identifier:** TC-02
2. **Purpose:** Verify a user can join an existing room using a valid room name.
3. **Description:** A second user navigates to the landing page, enters a username and the room name of an existing room, and clicks "Join Room".
4. **Inputs:** Username: "Player2", Room Name: "TestRoom".
5. **Expected Outputs:** The user is redirected to the Lobby screen, and the host sees the new player in the player list.
6. **Indication:** Normal
7. **Type:** Blackbox
8. **Category:** Functional
9. **Level:** Integration

**TC-03: Join Non-existent Room**

1. **Identifier:** TC-03
2. **Purpose:** Verify proper error handling when attempting to join a room that does not exist.
3. **Description:** A user attempts to join a room with a name that has not been created.
4. **Inputs:** Username: "Player3", Room Name: "InvalidRoom".
5. **Expected Outputs:** An error message "Room not found" is displayed, and the user remains on the landing page.
6. **Indication:** Abnormal
7. **Type:** Blackbox
8. **Category:** Functional
9. **Level:** Integration

**TC-04: Host Reassignment on Disconnect**

1. **Identifier:** TC-04
2. **Purpose:** Verify that host privileges are transferred to another player if the host disconnects.
3. **Description:** In a room with multiple players, the host closes their browser tab.
4. **Inputs:** Host triggers "disconnect" event.
5. **Expected Outputs:** The server detects the disconnection, removes the host from the player list, and assigns the "Host" role to the next player in the list. The new host receives a notification.
6. **Indication:** Abnormal
7. **Type:** Whitebox
8. **Category:** Functional
9. **Level:** Unit

### Game Flow & Rounds

**TC-05: Start Game**

1. **Identifier:** TC-05
2. **Purpose:** Verify the game starts for all players when the host initiates it.
3. **Description:** The host clicks the "Start Game" button in the Lobby.
4. **Inputs:** Host Click Event.
5. **Expected Outputs:** All connected clients transition from the Lobby view to the first round (Scribble Round).
6. **Indication:** Normal
7. **Type:** Blackbox
8. **Category:** Functional
9. **Level:** Integration

**TC-06: Scribble Round Input**

1. **Identifier:** TC-06
2. **Purpose:** Verify that drawing input is captured during the Scribble round.
3. **Description:** A player draws a line on the canvas during the Scribble round.
4. **Inputs:** Mouse/Touch events on the canvas.
5. **Expected Outputs:** The canvas displays the drawn line.
6. **Indication:** Normal
7. **Type:** Blackbox
8. **Category:** Functional
9. **Level:** Unit

**TC-07: Round Timer Expiry**

1. **Identifier:** TC-07
2. **Purpose:** Verify that the game automatically transitions to the next round when the timer runs out.
3. **Description:** Players wait for the countdown timer to reach 0 during any round.
4. **Inputs:** None (Time passage).
5. **Expected Outputs:** The current round ends, drawing data is submitted automatically, and the game transitions to the next round (e.g., Scribble -> Line).
6. **Indication:** Normal
7. **Type:** Blackbox
8. **Category:** Functional
9. **Level:** Integration

**TC-08: Drawing Rotation**

1. **Identifier:** TC-08
2. **Purpose:** Verify that a player's drawing is passed to a different player in the next round.
3. **Description:** Player A submits a scribble. The game transitions to the Line round.
4. **Inputs:** Player A's Scribble Data.
5. **Expected Outputs:** Player B sees Player A's scribble on their canvas to draw lines over it.
6. **Indication:** Normal
7. **Type:** Whitebox
8. **Category:** Functional
9. **Level:** Integration

**TC-09: Color Round Layering**

1. **Identifier:** TC-09
2. **Purpose:** Verify that the coloring layer is rendered correctly below the line art.
3. **Description:** A player fills colors during the Color round.
4. **Inputs:** Color fill actions.
5. **Expected Outputs:** Colors appear underneath the black lines drawn in the previous round, not obscuring them.
6. **Indication:** Normal
7. **Type:** Blackbox
8. **Category:** Functional
9. **Level:** Unit

**TC-10: End of the World (EOTW) Scenario**

1. **Identifier:** TC-10
2. **Purpose:** Verify that the EOTW scenario is displayed to all players.
3. **Description:** The game reaches the EOTW round after the Name round.
4. **Inputs:** Game State Transition.
5. **Expected Outputs:** A random "End of the World" scenario (text/image) is displayed on all client screens.
6. **Indication:** Normal
7. **Type:** Blackbox
8. **Category:** Functional
9. **Level:** Integration

**TC-11: Presentation Phase**

1. **Identifier:** TC-11
2. **Purpose:** Verify that players can present their beast.
3. **Description:** During the presentation round, the current presenter's beast is shown to everyone.
4. **Inputs:** Automatic sequence.
5. **Expected Outputs:** All players see the beast currently being presented.
6. **Indication:** Normal
7. **Type:** Blackbox
8. **Category:** Functional
9. **Level:** Integration

**TC-12: Voting Mechanism**

1. **Identifier:** TC-12
2. **Purpose:** Verify that players can vote for a beast and votes are tallied.
3. **Description:** In the Voting round, players select their favorite beast.
4. **Inputs:** Player clicks on a beast card.
5. **Expected Outputs:** The vote is recorded. Self-voting is prevented (if applicable). The winner is determined based on the highest votes.
6. **Indication:** Normal
7. **Type:** Whitebox
8. **Category:** Functional
9. **Level:** Integration

**TC-13: Winner Announcement**

1. **Identifier:** TC-13
2. **Purpose:** Verify the winner screen displays the correct result.
3. **Description:** After voting concludes, the results are calculated.
4. **Inputs:** Vote Tally.
5. **Expected Outputs:** The beast with the most votes is displayed as the winner.
6. **Indication:** Normal
7. **Type:** Blackbox
8. **Category:** Functional
9. **Level:** Integration

**TC-14: Play Again**

1. **Identifier:** TC-14
2. **Purpose:** Verify the host can restart the game with the same group.
3. **Description:** On the winner screen, the host clicks "Play Again".
4. **Inputs:** Host Click Event.
5. **Expected Outputs:** All players are returned to the Lobby state.
6. **Indication:** Normal
7. **Type:** Blackbox
8. **Category:** Functional
9. **Level:** Integration

### Edge Cases

**TC-15: Minimum Players**

1. **Identifier:** TC-15
2. **Purpose:** Verify the game cannot start with fewer than the minimum required players (e.g., 2).
3. **Description:** Host attempts to start game with only 1 player in the lobby.
4. **Inputs:** Host clicks "Start Game".
5. **Expected Outputs:** Game does not start; a warning message "Need at least 2 players" is displayed.
6. **Indication:** Boundary
7. **Type:** Blackbox
8. **Category:** Functional
9. **Level:** Integration

**TC-16: Player Late Join**

1. **Identifier:** TC-16
2. **Purpose:** Verify behavior when a player tries to join a game in progress.
3. **Description:** A user attempts to join a room where the game has already started.
4. **Inputs:** Join Room Request.
5. **Expected Outputs:** Access denied or player joins as a spectator (depending on design).
6. **Indication:** Abnormal
7. **Type:** Blackbox
8. **Category:** Functional
9. **Level:** Integration

**TC-17: Empty Drawing Submission**

1. **Identifier:** TC-17
2. **Purpose:** Verify the system handles empty drawings.
3. **Description:** A player submits a round without drawing anything.
4. **Inputs:** Empty canvas submit.
5. **Expected Outputs:** The round completes successfully; the blank canvas is passed to the next player.
6. **Indication:** Abnormal
7. **Type:** Blackbox
8. **Category:** Functional
9. **Level:** Unit

**TC-18: Special Characters in Name**

1. **Identifier:** TC-18
2. **Purpose:** Verify that user names and room names handle special characters correctly.
3. **Description:** Create a room with name "R@@m#1!".
4. **Inputs:** Room Name: "R@@m#1!".
5. **Expected Outputs:** Room created successfully, name displayed correctly.
6. **Indication:** Boundary
7. **Type:** Blackbox
8. **Category:** Functional
9. **Level:** Unit

**TC-19: Server Crash Recovery**

1. **Identifier:** TC-19
2. **Purpose:** Verify client behavior if the server becomes unreachable.
3. **Description:** Stop the server while a game is in progress.
4. **Inputs:** Server Stop.
5. **Expected Outputs:** Clients display a "Connection Lost" message.
6. **Indication:** Abnormal
7. **Type:** Blackbox
8. **Category:** Reliability
9. **Level:** Integration

**TC-20: Maximum Message Size**

1. **Identifier:** TC-20
2. **Purpose:** Verify that extremely large drawing data does not crash the server.
3. **Description:** Simulate a client sending a manipulated, oversized payload for a drawing.
4. **Inputs:** 10MB JSON payload.
5. **Expected Outputs:** Server rejects the message or handles it gracefully without crashing.
6. **Indication:** Abnormal
7. **Type:** Whitebox
8. **Category:** Performance
9. **Level:** Integration

## Part III. Test Case Matrix

| ID    | Name                     | Normal/Abnormal/Boundary | Blackbox/Whitebox | Functional/Performance | Unit/Integration |
| ----- | ------------------------ | ------------------------ | ----------------- | ---------------------- | ---------------- |
| TC-01 | Create Room              | Normal                   | Blackbox          | Functional             | Integration      |
| TC-02 | Join Room                | Normal                   | Blackbox          | Functional             | Integration      |
| TC-03 | Join Non-existent Room   | Abnormal                 | Blackbox          | Functional             | Integration      |
| TC-04 | Host Reassignment        | Abnormal                 | Whitebox          | Functional             | Unit             |
| TC-05 | Start Game               | Normal                   | Blackbox          | Functional             | Integration      |
| TC-06 | Scribble Round Input     | Normal                   | Blackbox          | Functional             | Unit             |
| TC-07 | Round Timer Expiry       | Normal                   | Blackbox          | Functional             | Integration      |
| TC-08 | Drawing Rotation         | Normal                   | Whitebox          | Functional             | Integration      |
| TC-09 | Color Round Layering     | Normal                   | Blackbox          | Functional             | Unit             |
| TC-10 | EOTW Scenario            | Normal                   | Blackbox          | Functional             | Integration      |
| TC-11 | Presentation Phase       | Normal                   | Blackbox          | Functional             | Integration      |
| TC-12 | Voting Mechanism         | Normal                   | Whitebox          | Functional             | Integration      |
| TC-13 | Winner Announcement      | Normal                   | Blackbox          | Functional             | Integration      |
| TC-14 | Play Again               | Normal                   | Blackbox          | Functional             | Integration      |
| TC-15 | Minimum Players          | Boundary                 | Blackbox          | Functional             | Integration      |
| TC-16 | Player Late Join         | Abnormal                 | Blackbox          | Functional             | Integration      |
| TC-17 | Empty Drawing Submission | Abnormal                 | Blackbox          | Functional             | Unit             |
| TC-18 | Special Characters       | Boundary                 | Blackbox          | Functional             | Unit             |
| TC-19 | Server Crash Recovery    | Abnormal                 | Blackbox          | Reliability            | Integration      |
| TC-20 | Max Message Size         | Abnormal                 | Whitebox          | Performance            | Integration      |
