# Real time web - Trendwatch Twitter
[Live Demo](http://dylanvs-real-time.herokuapp.com/)

## Concept
In this app the goal of the user is to guess which Trending Topic on Twitter will get the most tweets in 60 seconds. First, the user picks a country from which the trending topics will come from. Then, he can choose from six trending topics. These six consist of the top two trending topics and four randomly picked trending topics from the top 10(top two excluded).

When the user has chosen a topic, a bar chart will be displayed with real time data. After 60 seconds, if the choice of the user and the topic with the most tweets matches, the user has won.

![Screenshots game](https://github.com/dylanvans/real-time-web/blob/master/md-img/screenshots.png?raw=true)

## Data life cycle
1. A user selects a country
2. Via the server, a request is done to twitter for trending topics from the selected country
``` javascript
client.get('trends/place', {id: woeid}, function() {});
```
3. Six topics are presented to the client and are pushed in an array like this:
``` javascript
[
	{
		name: '#WeStandTogether',
		numberOfTweets: 0
	},
	{
		name: 'Quintana',
		numberOfTweets: 0
	},
	...
]
```
4. The user selects a topic
5. On the server, a stream to Twitter tracks all six trending topics on new tweets.
``` javascript
client.stream('statuses/filter', {track: socket.trackString}, function(stream) {});
```
6. The stream is filtered on the language of the selected country
7. If a new tweet comes in, the object of the topic belonging to the tweet will be updated. Where 'numberOfTweets' will get plus one.
``` javascript
stream.on('data', function(tweet) {});
```
8. When the data is up to date a socket event is send to the client to update their data.
``` javascript
socket.emit('new tweet', socket.topics, tweet);
```

## Features
- Usernames for users
- Connection server and client through sockets, with socket.io
- Get tweets from multiple trending topics
- Real time data visualization of the tweets that come in
- Notify user when an error occurs on the stream with twitter
- Notify user when connection between client and server fails
- Same data on server and client, even with tunnel events
- Read all the tweets afterwards

## Wishlist
- OAuth 'Sign in with Twitter' option, so a user can share their predictions or score. And so the app has no rate limiting issues anymore.
- Database integration for users, users score and the twitter data itself
- A durable socket based timer. Right now the timer isn't exact and a bit unpredictable because of tunnel events
- Browser/device testing
- Refactor code to modules

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
### Server
- `connection` - Set all the other events on the connected socket
- `new user` - Check if user already exist on server. If not, push es user to users array.
- `set country` - Sets country and woeid to get trending topics
- `trendingtopics` - Emits the collected topics to the client
- `set streams` - Set streams with twitter to collect the tweets from the trending topics
- `error on stream` - If an error occurs on the stream emit this to the client
- `new tweet` - Emit the updated data to the client 
- `stop game` - Emit to the client that the game is over
- `disconnect` - Filter the disconnected user out of the users array

### Client
- `disconnect` - Show connection error to user
- `reconnect` - Hide the connection error 
- `new user` - Send username to server
- `trending topics` - Retrieve the trending topics from the server
- `new tweet` - update the data with the new data from the server and update the bar chart
- `error on stream` - Show error notification to user
- `set country` - Send selected country to server
- `set streams` - Start the game
- `stop game` - Stop the timer and set the results of the game

## Tooling
- Express
- Node.js
- Socket.io

## Sources
- [xo](https://github.com/sindresorhus/xo)
- [Socket.io](https://socket.io/)
- [Express](https://expressjs.com/)
- [ejs](https://www.npmjs.com/package/ejs)


