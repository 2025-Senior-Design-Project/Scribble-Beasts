CS5001: Senior Design Project

# Scribble Beasts

## Table of Contents

1. [Members](#members)
2. [Project Abstract](#project-abstract)
3. [Project Description](#project-description)
4. [User Stories](/documents/User_Stories.md)
5. [Design Diagrams](/documents/Design_Diagrams/Design_Diagrams.md)
6. [Task List](/documents/essays/Tasklist.md)
7. [Timeline](/documents/timeline.md)
8. [Effort Matrix](/documents/effort_matrix.md)
9. [ABET Concerns Essay](/documents/essays/constraints-essay.md)
10. [PPT Slideshow](https://docs.google.com/presentation/d/18-QyqXY7taJ1myYvVH_GkVbm9iNFZ_A1/edit?usp=drive_link&ouid=103739955886447715192&rtpof=true&sd=true)
11. [Self-Assessment Essays](/documents/biographies/Self-Assessment_Essays.md)
12. [Professioal Biographies](/documents/biographies/professional-biographies.md)
13. [Budget](/documents/budget.md)
14. [Appendix](#appendix)
    include appropriate references, citations, links to code repositories, and meeting notes.
    there should be evidence justifying 45 hours of effort for each team member.

15. [Documentation](/docs/README.md)

## Members

### Team

[Jasmine Mogadam](documents/biographies/jasmine-mogadam-bio.md) - Computer Science Major ( mogadajh@mail.uc.edu )

[Ana Cedillo](documents/biographies/ana-cedillo-bio.md) - Computer Science Major ( cedillak@mail.uc.edu )

[Ethan Chaplin](documents/biographies/ethan-chaplin-bio.md) - Computer Science Major ( chapliep@mail.uc.edu )

### Advisor

[Badri Vellambi](https://researchdirectory.uc.edu/p/vellambn) - Associate CEAS Professor ( vellambn@ucmail.uc.edu )

## Project Abstract

Scribble Beasts is an innovative multiplayer party game designed to solve common pain points of group video games, such as player limits, needing multiple copies, and dependence on physical resources like controllers. This online game supports two to infinite players and requires only a web-browser-enabled device per person. The core gameplay loop involves a collaborative, artistic process: players transform a simple Scribble through stages of Line, Color, Detail, and Name to create a unique "Scribble Beast," with rounds lasting a couple minutes.

## Project Description

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

## Appendix

[Project Management](https://github.com/orgs/2025-Senior-Design-Project/projects/2)
Meetings once a week Thursday 11:30am-1:45pm at TUC
Make-up meetings on Friday 10am on Discord
Based off hackathon project of the same name https://github.com/Jasmine-Mogadam/scribble-beasts-hackathon

Playtests will be occuring on our offical Discord server! Please keep an eye out :D
You can join here: https://discord.gg/BQ4JUh8fCE
