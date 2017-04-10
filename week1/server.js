var express = require('express');
var path = require('path');

var app = express();

var server = require('html').createServer(app);

// Require Routes
var indexRouter = require('./routes/index');

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static('public'));

app.use('/', indexRouter);

app.listen(3001, function() {
	console.log('Listening on port 3001');
});
