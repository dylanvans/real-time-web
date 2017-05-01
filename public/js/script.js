(function () {
	class App {
		constructor() {
			this.barChart = new BarChart(this);
			this.sockets = new Sockets(this);
		}

		init() {
			this.sockets.makeConnection();
		}
	}

	class Sockets {
		constructor(app) {
			this.app = app;
			this.socket = io.connect();
		}

		makeConnection() {
			var topicsContainer = document.querySelector('.container-trending-topic');

			this.socket.on('trendingtopics', function(topics) {
				topicsContainer.innerHTML = '';

				topics.forEach(function(topic) {
					var el = document.createElement('div');
					var cleanId = cleanString(topic.name);

					el.innerHTML = topic.name;
					el.id = 'topic-' + cleanId;
					topicsContainer.appendChild(el);
				});

				app.barChart.set(topics);
			});

			this.socket.on('topic tweet', function(data) {
				app.barChart.update(data)
				// var cleanId = cleanString(topic.name);
				// document.querySelector('#topic-' + cleanId).innerHTML = topic.numberOfTweets;
			});

			function cleanString(string) {
				// source: https://stackoverflow.com/questions/3780696/javascript-string-replace-with-regex-to-strip-off-illegal-characters?answertab=votes#tab-top
				return string.replace(/[|&;$%@"#<>()+,]/g, "");
			}
		}
	}

	class BarChart {
		constructor(app) {
			this.app = app
		}

		set(data) {
			console.log(this)
			this.chartContainer = document.querySelector('.container-bar-chart');
			this.margin = {top: 10, right: 10, bottom: 10, left: 10};
			this.width = this.chartContainer.offsetWidth - this.margin.left - this.margin.right;
			this.height = this.chartContainer.offsetHeight - this.margin.top - this.margin.bottom;

			this.svg = d3.select(".container-bar-chart")
							.append("svg")
					    	.attr("width", this.width)
					    	.attr("height", this.height);

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

			this.barGroup = this.svg.append("g")
					.attr("class", "group-bar-chart")
					.attr("transform", "translate(" + (this.width - this.barChartWidth) + "," + ((this.height - this.barChartHeight) - (this.margin.top*2)) + ")");

			this.update(data);
		}

		update(data) {
			document.querySelector('.group-bar-chart').innerHTML = '';

			this.xScale.domain(data.map(function(d) { return d.name }));
			this.yScale.domain([d3.min(data, function(d, i) { return d.numberOfTweets; }), (d3.max(data, function(d, i) { return d.numberOfTweets; }) + 10)]);

			this.barGroup.append("g")
				.attr("class", "x-axis axis axis-bar-chart")
				.attr("transform", "translate(0," + this.barChartHeight + ")")
				.call(this.xAxis);

			this.barGroup.append("g")
					.attr("class", "y-axis axis axis-bar-chart")
						.call(this.yAxis)
						.append("text")
						.classed("label label-bar", true)
						.attr("transform", "rotate(-90)")
						.attr("y", -35)
						.attr("x", -(this.barChartHeight))
						.text("TOTAL TWEETS");

			var bars = this.barGroup.selectAll('bar').data(data);

			bars.exit()
				.remove();

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

	var app = new App();
	app.init();
})();
