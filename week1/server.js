var path = require('path');
var express = require('express');

var app = express();

var server = require('http').createServer(app);
var io = require('socket.io')(server);

// Require Routes
var indexRouter = require('./routes/index');

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static('public'));

app.use('/', indexRouter);

io.on('connection', function(socket) {
	console.log('a user connected');
});

server.listen(3001, function() {
	console.log('Listening on port 3001');
});
