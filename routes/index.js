var express = require('express');

var router = express.Router();

router.get('/', function(req, res) {
	var stream = router.client.stream('statuses/filter', {track: 'scorsese'});

	stream.on('data', function(event) {
		// console.log(event && event.text);
	});

	router.client.get('trends/place', {id: 1}, function(err, data) {
		if (err) throw err;
		console.log(data);  // The favorites.
	});

	res.render('index');
});

// Export router to server
module.exports = router;
