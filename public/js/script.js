(function () {
	function socketMessages() {
		var socket = io.connect();

		var messageFormEl = document.querySelector('.message-form');
		var messageInputEl = document.querySelector('.message-input');
		var messageList = document.querySelector('.message-list');

		messageFormEl.addEventListener('submit', function(e) {
			e.preventDefault();

			socket.emit('send message', messageInputEl.value);
		});

		socket.on('send message', function(data) {
			messageList.insertAdjacentHTML('beforeend', `<li> ${data} </li>`);
		});
	}

	socketMessages();
})();
