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

			console.log('new user ', users)
		}
	});

	socket.on('set country', function(country, woeid) {
		socket.selectedCountry = country;
		socket.selectedWoeid = woeid;
		socket.selectedLang = (country == 'nl') ? 'nl' : 'en';

		getTrendingTopics(woeid, emitTrendingTopics);

		function emitTrendingTopics(topics, trackString) {
			socket.topics = topics;
			socket.trackString = trackString;
			socket.emit('trendingtopics', topics);
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
					if(tweet.user.lang === socket.selectedLang) {
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
			}, 60000);
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

function getTrendingTopics(woeid, callback) {
	client.get('trends/place', {id: woeid}, function(err, data) {
		if (err) { console.error(err); }

		var trendingArray = [];
		var trackString = [];

		var subsetTrends = data[0].trends.slice(0, 10);
		var top2 = subsetTrends.slice(0, 2);
		var remaining = subsetTrends.slice(2, 6);
		var trends = top2.concat(remaining);
		trends = shuffle(trends);

		for (var i = 0; i < trends.length; i++) {
			var topicObject = {
				name: trends[i].name,
				numberOfTweets: 0
			};
			trendingArray.push(topicObject);
			trackString.push(trends[i].name);
		}
		trackString = trackString.join(', ');

		callback(trendingArray, trackString);
	});
}

function shuffle(array) {
	// Source: https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

app.get('/', function(req, res) {
	res.render('index');
});

http.listen(process.env.PORT || 3001, function() {
	console.log('Listening on port 3001');
});
