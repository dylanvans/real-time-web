(function() {
	var app = {
		init: function() {
			user.init();
		},
	};

	var user = {
		init: function() {
			this.connectSocket();
			this.usernameForm();
		},
		connectSocket: function() {
			this.socket = io.connect();
		},
		usernameForm: function() {
			this.formContainer = document.querySelector('.container-user-form');
			this.formEl = this.formContainer.querySelector('.username-form');
			this.userInputEl = this.formEl.querySelector('.username-input');
			this.feedbackEl = this.formEl.querySelector('.username-error');

			this.formEl.addEventListener('submit', function(e) {
				e.preventDefault();

				this.socket.emit('new user', this.userInputEl.value, function(data) {
					if (data) {
						this.formContainer.classList.add('hide');
						twitter.getTrendingTopics();
					} else {
						this.feedbackEl.innerHTML = 'Username already in use';
					}
				}.bind(this));
			}.bind(this));
		}
	};

	var twitter = {
		getTrendingTopics: function() {
			user.socket.on('trendingtopics', function(data) {
				this.trendingTopics = data;
				game.chooseTopic();
			}.bind(this));
		},
		getTweets: function() {
			user.socket.on('new tweet', function(data) {
				barChart.update(data)
			});
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
				element.innerHTML = topic.name;
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

			user.socket.emit('set streams');

			twitter.getTweets();

			this.chooseTopicContainer.classList.add('hide');
			this.gameContainer.classList.remove('hide');
			
			barChart.set(twitter.trendingTopics);
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

			this.barChartWidth = this.width - 70;
			this.barChartHeight = this.height - 20;

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

	app.init();

})();
