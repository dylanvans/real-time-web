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

var trendingArray = [];

function getTrendingTopics() {
	trendingArray = [];
	// The Netherlands id 23424909
	// Global id 1
	client.get('trends/place', {id: 1},  function(err, data) {
		if (err) console.error(err);
		console.log('updating trending topics');

		var trackString = [];
		for (var i = 0; i < 5; i++) {
			var topicObject = {
				name: data[0].trends[i].name,
				numberOfTweets: 0
			}
			trendingArray.push(topicObject);
			trackString.push(data[0].trends[i].name);
		}

		io.emit('trendingtopics', trendingArray)
		trackString = trackString.join(', ');
		setStream(trackString);
	});
}

function setStream(trackTopics) {
	var stream = client.stream('statuses/filter', { track: trackTopics });

	stream.on('data', function(tweet) {
		if(tweet.text) {
			trendingArray.forEach(function(topic) {
				if((tweet.text).includes(topic.name)) {
					topic.numberOfTweets++
					io.emit('topic tweet', trendingArray);
				}		
			});
		}
	});
}

getTrendingTopics();
setInterval(getTrendingTopics, 60000);

io.on('connection', function(socket) {
	if(trendingArray) {
		io.emit('trendingtopics', trendingArray)
	}
});

app.get('/', function(req, res) {
	res.render('index');
});

http.listen(process.env.PORT || 3001, function() {
	console.log('Listening on port 3001');
});
