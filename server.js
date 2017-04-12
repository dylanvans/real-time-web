// Require
var path = require('path');
var express = require('express');
var server = require('http');
var io = require('socket.io')

var app = express();

server = server.createServer(app);
io = io(server);

// Require Routes
var indexRouter = require('./routes/index');

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static('public'));

app.use('/', indexRouter);

io.on('connection', function(socket) {
	console.log('a user connected');

	socket.on('send message', function(data) {
		console.log('send message: ', data)
		io.emit('send message', data);
	});
});

server.listen(process.env.PORT || 3001, function() {
	console.log('Listening on port 3001');
});
