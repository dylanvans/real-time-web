// Require
var path = require('path');
var http = require('http');
var request = require('request');
var dotenv = require('dotenv');
var express = require('express');
var twitter = require('twitter');
var io = require('socket.io');
var indexRouter = require('./routes/index');

// Config
var app = express();
dotenv.config();
http = http.createServer(app);
io = io(http);
var users = [];

app.twitterConsumerKey = process.env.TWITTER_CONSUMER_KEY;
app.twitterConsumerSecret = process.env.TWITTER_CONSUMER_SECRET;
app.twitterAccesTokenKey = process.env.TWITTER_ACCESS_TOKEN_KEY;
app.twitterAccesTokenSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET;

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static('public'));

var client = new twitter({
	consumer_key: app.twitterConsumerKey,
	consumer_secret: app.twitterConsumerSecret,
	access_token_key: app.twitterAccesTokenKey,
	access_token_secret: app.twitterAccesTokenSecret
});

io.on('connection', function(socket) {
	socket.on('new user', function(data, callback) {
		var userFound = false;

		for (var i = 0; i < users.length; i++) {
			if (users[i].username == data) {
				callback(false);
				userFound = true;
				break;
			}
		}

		if (!userFound) {
			callback(true);
			socket.username = data;
			users.push({username: socket.username});

			getTrendingTopics(emitTrendingTopics);

			function emitTrendingTopics(topics, trackString) {
				socket.topics = topics
				socket.trackString = trackString
				socket.emit('trendingtopics', topics);
			}
			console.log('new user ', users)
		}
	});

	socket.on('set streams', function() {
		client.stream('statuses/filter', {track: socket.trackString}, function(stream) {
			stream.on('error', function(error) {
				socket.emit('error on stream', error)
				console.log(error)
			});

			stream.on('data', function(tweet) {
				if(tweet.user) {
					if(tweet.user.lang === 'en') {
						socket.topics.forEach(function(topic) {
							if ((tweet.text).includes(topic.name)) {
								topic.numberOfTweets++;
								socket.emit('new tweet', socket.topics, tweet);
							}		
						});
					}
				}
			});

			setTimeout(function() {
				stream.destroy();
				socket.emit('stop game');
			}, 30000);
		});
	});

	socket.on('disconnect', function(data) {
		if (!socket.username) return;

		users = users.filter(function(user) {
			return user.username !== socket.username;
		});

		console.log('disconnect ',  users)
	});
});

function getTrendingTopics(callback) {
	// The Netherlands woeid 23424909
	// Global woeid 1
	// uk woeid 23424975
	// USA woeid 23424977
	client.get('trends/place', {id: 23424977}, function(err, data) {
		if (err) { console.error(err); }

		var trendingArray = [];
		var trackString = [];
		for (var i = 0; i < 6; i++) {
			var topicObject = {
				name: data[0].trends[i].name,
				numberOfTweets: 0
			};
			trendingArray.push(topicObject);
			trackString.push(data[0].trends[i].name);
		}
		trackString = trackString.join(', ');

		callback(trendingArray, trackString);
	});
}

app.get('/', function(req, res) {
	res.render('index');
});

http.listen(process.env.PORT || 3001, function() {
	console.log('Listening on port 3001');
});
