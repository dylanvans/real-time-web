// Require
var path = require('path');
var server = require('http');
var request = require('request');
var dotenv = require('dotenv');
var express = require('express');
var twitter = require('twitter');
var io = require('socket.io');
var indexRouter = require('./routes/index');

// Config
var app = express();
dotenv.config();
server = server.createServer(app);
io = io(server);

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

app.get('/', function(req, res) {
	var stream = client.stream('statuses/filter', {track: 'scorsese'});

	stream.on('data', function(event) {
	  // console.log(event && event.text);
	});

	client.get('trends/place', {id: 1},  function(err, data) {
	  // if(error) throw error;
	  console.log(data);  // The favorites.
	});

	res.render('index');
});

// io.on('connection', function(socket) {
// 	console.log('a user connected');

// 	socket.on('send message', function(data) {
// 		console.log('send message: ', data);
// 		io.emit('send message', data);
// 	});
// });

server.listen(process.env.PORT || 3001, function() {
	console.log('Listening on port 3001');
});
