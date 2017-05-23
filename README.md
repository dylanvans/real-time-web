# Real time web - Trendwatch Twitter
[Live Demo](http://dylanvs-real-time.herokuapp.com/)

## Concept
In this app the goal of the user is to guess which Trending Topic on Twitter will get the most tweets in 60 seconds. First, the user picks a country from which the trending topics will come from. Then, he can choose from six trending topics. These six consist of the top two trending topics and four randomly picked trending topics from the top 10(top two excluded).

When the user has chosen a topic, a bar chart will be displayed with real time data. After 60 seconds, if the choice of the user and the topic with the most tweets matches, the user has won.

![Screenshots game]()

## Data

## Features
- Send and receive text messages through a socket.
- Usernames for every user.

## Wishlist
- Database


## Installation
1. Clone repository
```
git clone https://github.com/dylanvans/real-time-web && cd real-time-web
```
2. Install dependencies
```
npm install
```
3. Setup .env variables
```
TWITTER_CONSUMER_KEY
TWITTER_CONSUMER_SECRET
TWITTER_ACCESS_TOKEN_KEY
TWITTER_ACCESS_TOKEN_SECRET
```
4. Start server
```
npm start
```

## Dev options
Lint
```
npm run lint 
```

## Events
- socket.on('new user')
- socket.on('set country')
- socket.emit('trendingtopics')
- socket.on('set streams')
- stream.on('error') -> socket.emit('error on stream')
- socket.on('new tweet')
- socket.emit('stop game')
- socket.on('disconnect')

## Tooling
- Express
- Node.js
- Socket.io

## Sources
- [xo](https://github.com/sindresorhus/xo)
- [Socket.io](https://socket.io/)
- [Express](https://expressjs.com/)
- [ejs](https://www.npmjs.com/package/ejs)


