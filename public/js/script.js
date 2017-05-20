(function() {
	var app = {
		init: function() {
			user.init();
		},
	};

	var user = {
		init: function() {
			this.setConnection();
			this.usernameForm();
			this.setPlayAgainBtn();
			twitter.setError();
		},
		setConnection: function() {
			this.socket = io.connect();
			this.connectionErrorContainer = document.querySelector('.container-connection-error');

			navigator.onLine ? this.connectionErrorContainer.classList.add('hide') : this.connectionErrorContainer.classList.remove('hide');

			window.addEventListener('offline', function() {
				this.connectionErrorContainer.classList.remove('hide');
			}.bind(this));
			window.addEventListener('online', function() {
				this.connectionErrorContainer.classList.add('hide');
			}.bind(this));

			this.socket.on('disconnect', function() {
				this.connectionErrorContainer.classList.remove('hide');
			}.bind(this));

			this.socket.on('reconnect', function() {
				this.connectionErrorContainer.classList.add('hide');
			}.bind(this));
		},
		usernameForm: function() {
			this.formContainer = document.querySelector('.container-user-form');
			this.formEl = this.formContainer.querySelector('.username-form');
			this.userInputEl = this.formEl.querySelector('.username-input');
			this.feedbackEl = this.formEl.querySelector('.username-error');

			this.formEl.addEventListener('submit', function(e) {
				e.preventDefault();
				var inputValue = this.userInputEl.value;

				this.socket.emit('new user', inputValue, function(data) {
					if (data) {
						this.formContainer.classList.add('hide');
						this.username = inputValue;
						twitter.getTrendingTopics();
					} else {
						this.feedbackEl.innerHTML = 'Username already in use';
					}
				}.bind(this));
			}.bind(this));
		},
		setPlayAgainBtn: function() {
			this.playAgainBtnEl = document.querySelectorAll('.btn-play-again');

			this.playAgainBtnEl.forEach(function(el) {
				el.addEventListener('click', function() {
					window.location.reload(false);
				});
			});
		}
	};

	var twitter = {
		getTrendingTopics: function() {
			user.socket.on('trendingtopics', function(data) {
				utils.shuffleArray(data, callback);

				function callback() {			
					game.chooseTopic()
				}
			}.bind(this));
		},
		getTweets: function() {
			user.socket.on('new tweet', function(data, tweet) {
				twitter.data = data;
				barChart.update(data);
				game.setTweetText(tweet.text, tweet.user.name);
				console.log(twitter.data)
			});
		},
		setError: function() {
			this.errorContainer = document.querySelector('.container-error');
			this.errorMessageEl = this.errorContainer.querySelector('.error-message');

			user.socket.on('error on stream', function(error) {
				this.errorContainer.classList.remove('hide');

				if(error.source) {
					this.errorMessageEl.innerHTML = error.source;
				}
			}.bind(this));
		}
	};

	var game = {
		chooseTopic: function() {
			this.chooseTopicContainer = document.querySelector('.container-choose-topic');
			this.topicOptionsContainer = this.chooseTopicContainer.querySelector('.container-topic-options');

			this.chooseTopicContainer.classList.remove('hide');

			twitter.trendingTopics.forEach(function(topic) {
				var element = document.createElement('li');
				element.classList.add('topic-option');
				element.innerHTML = `<p>${topic.name}</p>`;
				element.id = topic.name;

				element.addEventListener('click', function() {
					user.socket.prediction = this.id;
					game.start();
				});

				this.topicOptionsContainer.appendChild(element);
			}.bind(this));
		},
		start: function() {
			this.gameContainer = document.querySelector('.container-game');

			this.setTimer();
			user.socket.emit('set streams');

			this.setPrediction();
			this.setStop();
			twitter.getTweets();

			this.chooseTopicContainer.classList.add('hide');
			this.gameContainer.classList.remove('hide');
			
			barChart.set(twitter.trendingTopics);
		},
		setStop: function() {
			user.socket.on('stop game', function(){
				clearInterval(game.timer);
				game.setResult();
				console.log('stop the game bitch')
			});
		},
		setTweetText: function(text, user) {
			this.tweetsContainer = this.gameContainer.querySelector('.container-tweets');

			var element = document.createElement('div');
				element.classList.add('container-tweet-text');
				element.innerHTML = `<div class="container-tweet-text">
										<p class="tweet-user">@${user}</p>
										<p class="tweet-text">${text}</p>
									</div>`;

			this.tweetsContainer.insertAdjacentHTML('afterbegin', element.innerHTML);
		},
		setPrediction: function() {
			this.predictionEl = this.gameContainer.querySelector('.prediction');
			this.predictionEl.innerHTML = user.socket.prediction;
		},
		setTimer: function() {
			var timerEl = this.gameContainer.querySelector('.counter');

			// Source: https://stackoverflow.com/questions/10541609/make-a-countdown-from-timer
			var count = 60;
			this.timer = setInterval(function() {
				timerEl.innerHTML = count--;
				if(count < 0) {
					clearInterval(this.timer);
					game.setResult();
				} 
			}.bind(this), 1000);
		},
		setResult: function() {
			this.resultContainer = this.gameContainer.querySelector('.container-result');
			this.asideTweetsEl = this.gameContainer.querySelector('.aside-tweets');
			this.resultHeadingEl = this.resultContainer.querySelector('.result-heading');
			this.userResultEl = this.resultContainer.querySelector('.user-result');
			this.twitterResultEl = this.resultContainer.querySelector('.twitter-result');
			
			this.topicWinner = twitter.data.reduce(function(prev, current) {
				return (prev.numberOfTweets > current.numberOfTweets) ? prev : current;
			});

			this.asideTweetsEl.style.overflowY = 'scroll';

			this.resultUser = (this.topicWinner.name === user.socket.prediction) ? 'right' : 'wrong';

			this.resultHeadingEl.innerHTML = (this.resultUser == 'right') ? `Congratulations <br> ${user.username}!` : `Better luck next<br> time ${user.username}!`;
			this.userResultEl.innerHTML = this.resultUser;
			this.twitterResultEl.innerHTML = this.topicWinner.name;

			this.resultContainer.classList.remove('hide');
		}
	};

	var barChart = {
		set: function(data) {
			this.chartContainer = document.querySelector('.container-bar-chart');
			this.margin = {top: 10, right: 10, bottom: 10, left: 10};
			this.width = this.chartContainer.offsetWidth - this.margin.left - this.margin.right;
			this.height = this.chartContainer.offsetHeight - this.margin.top - this.margin.bottom;

			this.svg = d3.select('.container-bar-chart')
							.append('svg')
							.attr('width', this.width)
							.attr('height', this.height);

			this.barChartWidth = this.width - 50;
			this.barChartHeight = this.height - 70;

			// Set ranges
			this.xScale = d3.scale.ordinal().rangeRoundBands([0, this.barChartWidth], .15);
			this.yScale = d3.scale.linear().range([this.barChartHeight, 0]);

			// Define axes
			this.xAxis = d3.svg.axis()
							.scale(this.xScale)
							.orient('bottom');

			this.yAxis = d3.svg.axis()
							.scale(this.yScale)
							.orient('left');

			this.barGroup = this.svg.append('g')
					.attr('class', 'group-bar-chart')
					.attr('transform', 'translate(' + (this.width - this.barChartWidth) + ',' + ((this.height - this.barChartHeight) - (this.margin.top * 2)) + ')');
			this.update(data);
		},
		update: function(data) {
			document.querySelector('.group-bar-chart').innerHTML = '';

			this.xScale.domain(data.map(function(d) {
				return d.name;
			}));

			this.yScale.domain([d3.min(data, function(d) {
				return d.numberOfTweets;
			}), (d3.max(data, function(d) {
				return d.numberOfTweets;
			}) + 10)]);

			this.barGroup.append('g')
				.attr('class', 'x-axis axis axis-bar-chart')
				.attr('transform', 'translate(0,' + this.barChartHeight + ')')
				.call(this.xAxis);

			this.barGroup.append('g')
					.attr('class', 'y-axis axis axis-bar-chart')
						.call(this.yAxis)
						.append('text')
						.classed('label label-bar', true)
						.attr('transform', 'rotate(-90)')
						.attr('y', -35)
						.attr('x', -(this.barChartHeight))
						.text('TOTAL TWEETS');

			var bars = this.barGroup.selectAll('bar').data(data);

			bars.exit().remove();

			var xScale = this.xScale;
			var yScale = this.yScale;
			var barChartHeight = this.barChartHeight;

			bars.enter().append('rect')
					.attr('class', 'bar-chart-rect')
					.attr('x', function(d) { return xScale(d.name); })
					.attr('width', this.xScale.rangeBand())
					.attr('y', function(d) { return yScale(d.numberOfTweets); })
					.attr('height', function(d) { return barChartHeight - yScale(d.numberOfTweets); });
		}
	}

	var utils = {
		shuffleArray: function(array, callback) {
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

			twitter.trendingTopics = array;
			callback(array)
		}
	}

	app.init();

})();
