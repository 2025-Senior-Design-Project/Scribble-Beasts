CS5001: Senior Design Project

# Team Scribble Beasts

## Members

[Jasmine Mogadam](documents/biographies/jasmine-mogadam-bio.md) - Computer Science Major ( mogadajh@mail.uc.edu )

[Ana Cedillo](documents/biographies/ana-cedillo-bio.md) - Computer Science Major ( cedillak@mail.uc.edu )

[Ethan Chaplin](documents/biographies/ethan-chaplin-bio.md) - Computer Science Major ( chapliep@mail.uc.edu )

## Topic Area

Scribble beasts is a web game that has players collaboratively create beasts out of scribbles to save the world.

### Game Loop

1. Host player creates a room
2. Other players join this room
3. Host player starts game when everyone is in
4. Each player scribbles, lines, colors, and names in rounds. Between each round the images players last worked on are given to a new player. This way everyone participates in making each beast.
5. A random apocalypse card is drawn, explaining how the world is about to end
6. Each player must argue why their beast would solve this problem
7. Players vote for the best beast
8. The game ends, announcing the winners, and the host can replay it.

### Implementation

Since these games will have a ton of events firing asynchronously, the server and client will use websockets to easily identify which player is doing what and how to handle it while in rooms. Even before they are in a room, the server can field user requests to join and create rooms via websockets. Once a player joins a room, their websocket can be put inside it on the server-side.

### Tools

#### Frontend

- Svelte
- Flowbite
- Canvas API
- Typescript

#### Backend

- Node.js
- ws
- Typescript

#### Routing

- Ngnix
- Docker
- Release Share
