# Design Diagrams

## D0

#### "As a friend, I want to play games with other friends, so I can socialize and strengthen my friendships."

![design diagram showing a docker setup with nginx, client, and backend servers](/documents/Design_Diagrams/D0.png)
We have everything stored in a docker container that can support multiplayer. Nginx acts as a proxy, forwarding users from the default 80 port to a configurable client port. This client's backend communicates to the server as players connect and play over a websocket connection. The users do not need to know which port these services are on, instead just connecting to / and .api respectively to communicate with other players (server) and view the game (client).

## D1

#### "As a host, I want a game that's easy to set up, so I can spend more time with my guests."

![relational design diagram between several data objects](/documents/Design_Diagrams/D1.png)
There are several different data objects needed to keep track of game state so that everyone's game experience is seamless and hassle-free. Parts should work together so players can join and leave rooms without any issues. The room object is the central area, storing players in and out of games. It, on the host player's command, will start the game and begin keeping track of what round it is and what actions it needs to send to players. Instead of each player needing to keep track of the rules of the game or divvy out pieces, the server enforces them through these relations.

## D3

#### "As a host, I want a game that's easy to set up, so I can spend more time with my guests."

![flowchart showing the steps of the game algorithm](/documents/Design_Diagrams/D2.png)
Same as before with a focus on the setup before the game starts. Hosts can easily create rooms and have special privleges that joining players do not. Players can easily join rooms by entering a room name (effectively a password). Goes into extreme depth on how the specific rounds work, with a timeout system if players take too long to complete a round, keeping the game going at a rapid pace.
