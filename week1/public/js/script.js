(function () {
	function socketMessages() {
		var socket = io.connect();

		var messageFormEl = document.querySelector('.message-form');
		var messageInputEl = document.querySelector('.message-input');

		messageFormEl.addEventListener('submit', function(e){
			e.preventDefault();

			socket.emit('send message', messageInputEl.value);
		});

		socket.on('send message', function(data) {
			messageFormEl.insertAdjacentHTML('afterend', `<p> ${data} </p>`)
		});
	}

	socketMessages();
})();