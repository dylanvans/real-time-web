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
	// The Netherlands id 23424909
	// Global id 1
	client.get('trends/place', {id: 23424909},  function(err, data) {
		if (err) console.error(err);
		console.log('updating trending topics');

		for (var i = 0; i < 5; i++) {
			trendingArray.push(data[0].trends[i].name);
		}

		var trackTopics = trendingArray.join(', ');
		setStream(trackTopics);
	});
}

function setStream(trackTopics) {
	var stream = client.stream('statuses/filter', { track: trackTopics });
console.log(trackTopics)
	stream.on('data', function(tweet) {
		if(tweet.text) {
			trendingArray.forEach(function(topic) {
				if((tweet.text).includes(topic)) {
					console.log(topic)
				}		
			});
		}
	});
}

getTrendingTopics();
setInterval(getTrendingTopics, 300000);

app.get('/', function(req, res) {
	console.log(trendingTopics)

	res.render('index');
});

http.listen(process.env.PORT || 3001, function() {
	console.log('Listening on port 3001');
});
