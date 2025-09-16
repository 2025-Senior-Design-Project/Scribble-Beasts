Five total paragraphs; Minimum of 6 sentences per paragraph.

# Jasmine Mogadam's Individual Capstone Assessment

## Introduction

This senior design project requires several skills I've built up in and out of college. It requires a complex docker setup, package management, a reverse proxy, and a javascript framework. It also includes more undefined skills like usability, managing customer feedback, and project management. The Scribble Beast idea was first written down as a card game, and I've been wanting to make it a jackbox-esc party game ever since. I've tried to get it set up as an independent research project over fall 2024 while I was on co-op, but I was unable to. Now I have the chance to work with others on this project and put everything I've learned to the test.

## Collective College Experiences

### College Curriculum

This game idea began in my Intro to Game Design class, a DMC course that was open to all majors. There I learned the importance of iteration and early customer feedback throughout the creation process. This has influenced our deadlines for playtesting, with the first occuring only after the barebones of websocket communication and drawing are setup. Software Development class taught me how to make design digrams, which I already used to make the in-depth UML diagram for our entire web-app's workflow. It was also helpful for figuring out the best way to structure the many complex data objects used throughout the Scribble Beast application. My classes about databases made me appreciate the simplicity of in-memory storage for small and short-lived objects. Because of them, Scribble Beasts depends on a single array of all rooms currently playing for data storage.

### Co-Op Experiences

I first learned about reverse proxies during my co-op at Nlign Analytics. I was amazed at how easy it make communication between several different services, organized into one port. They used Apache and Jetty, but I wanted something a bit newer with more syntatic sugar for my project. While something I taught myself, I knew I wanted to use this via nginx in a Docker conainer. While at LCS I got my first good test run of a javascript framework; Angular. Angular is one of the oldest frameworks, sharing some of the same extra scaffolding as C++ and Java have. While on co-op it was a puzzle to get it working at times, I learned a lot about asynchronous communication between client and server processes. Because of this experience I opted to go with, yet another, more syntatically sugary framework called Svelte. Instead of api calls, the communcation will be with the less structured and simpler, WebSocket.

## Motivation

I've been wanting to make a fully polished, playable mutliplayer game for a while now. I have previously made singleplayer webgames, and derived a lot of joy from the process. Seeing people laugh and smile from something I've made makes me extremely happy. When I held playtests for the physical card game version of Scribble Beasts, I got a ton of positive feedback. I want to see how well I can replicate this, and if it's possible to monetize the game. If I complete this project, I can extend it to work with other party games in the future.

## Preliminary Project Approach

The first part of game design is making something fun. Fun is such a subjective and hard-to-pin-down feature, but anyone can tell you when they find something fun or not. Lots of successful video games started with analog versions, so I thought using an existing card game I created would be perfect for the project. With the game loop in mind, I went to feedback I got from the analog game. Most complaints were waiting on other players for markers, dead pens, and other issues with the art supplies needed to play. I thought a web-version of the game would perfectly fix this issue. During playtests I hope to have a mostly positive rating for the game. I hope to complete the game in it's entirety and keep it hosted with a patreon linked for donations to keep it up in perpetuity. Contributions will be evaluated by the number of tasks I complete in our GitHub project, files written, and loosely on lines written. Since I'm also projecting managing, I want to make sure I don't have too high of a ratio to my teammates in those areas.
