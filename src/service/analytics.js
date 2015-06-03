var bugColor = "#CB1F26",
	taskColor = "#21579D",
	chartFontWeight = "300",
	chartFontSize = "16px";

var utils = require('../utils/utils'),
	usersService = require('../service/users'),
	_ = require('underscore')._;

exports.getChart = function (req, res) {
	switch (req.query.type) {
		case "loggedHours":
		{
			var callback = function (users) {
				var series = [];
				var currentDate = new Date();

				_.each(users, function (user) {
					var logged = [0, 0, 0, 0, 0, 0, 0];
					_.each(user.logs, function (log) {
						var tstamp = log.timestamp;
						if (tstamp && utils.getWeekNumber(currentDate) === utils.getWeekNumber(tstamp)) {
							var day = tstamp.getDay();
							logged[day] += log.amount;
						}
					});

					logged.push(logged.shift());

					series.push({
						name: user.username,
						data: logged
					});
				});

				var loggedHours = {
					chart: {
						type: 'line'
					},
					title: {
						text: 'Logged Hours',
						style: {
							fontWeight: chartFontWeight,
							fontSize: chartFontSize
						}
					},
					xAxis: {
						categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
						tickmarkPlacement: "on"
					},
					yAxis: {
						allowDecimals: false,
						min: 0,
						title: {
							text: 'Hours'
						}
					},
					tooltip: {
						formatter: function () {
							var suffix = (this.y === 1) ? ' hr.' : ' hrs.';
							return this.y + suffix;
						}
					},
					plotOptions: {
						line: {
							marker: {
								symbol: "circle"
							},
							enableMouseTracking: true
						}
					},
					credits: {
						enabled: false
					},
					series: series
				};

				res.json(loggedHours);
			};
			usersService.getAllUsersCallback(callback);
			break;
		}
		case "ticketCompletion":
		{
			var callback = function (users) {
				var usernames = [];
				var series = [{
					name: 'Bug',
					data: []
				}, {
					name: 'Task',
					data: []
				}];

				_.each(users, function (user) {
					usernames.push(user.username);
					var bt = 0,
						tt = 0;

					_.each(user.tickets, function (ticket) {
						if (ticket.status === "done" && ticket.owner === user.username) {
							if (ticket.type === "bug") {
								bt++;
							} else if (ticket.type === "task") {
								tt++;
							}
						}
					});

					series[0].data.push(bt);
					series[1].data.push(tt);
				});

				var ticketCompletion = {
					chart: {
						type: 'bar'
					},
					colors: [bugColor, taskColor],
					title: {
						text: 'Ticket Completion by User',
						style: {
							fontWeight: chartFontWeight,
							fontSize: chartFontSize
						}
					},
					xAxis: {
						categories: usernames,
						title: {
							text: null
						}
					},
					yAxis: {
						allowDecimals: false,
						min: 0,
						tickInterval: 5,
						title: {
							text: 'Amount',
							align: 'high'
						},
						labels: {
							overflow: 'justify'
						}
					},
					plotOptions: {
						bar: {
							dataLabels: {
								enabled: true
							}
						}
					},
					legend: {
						layout: 'vertical',
						align: 'right',
						verticalAlign: 'top',
						x: -40,
						y: 100,
						floating: true,
						borderWidth: 1,
						backgroundColor: '#FFFFFF',
						shadow: true
					},
					credits: {
						enabled: false
					},
					series: series
				};

				res.json(ticketCompletion);
			};
			usersService.getAllUsersCallback(callback);
			break;
		}
		case "effortEstimation":
		{
			var callback = function (users) {

				var bugEffortEstimation = [],
					taskEffortEstimation = [],
					maxEstimation = 0;

				_.each(users, function (user) {
					_.each(user.tickets, function (ticket) {
						if (ticket.status !== "done") {
							if (ticket.estimatedTime > maxEstimation) {
								maxEstimation = ticket.estimatedTime;
							}
							if (ticket.type === "bug") {
								bugEffortEstimation.push([ticket.estimatedTime, ticket.loggedTime]);
							} else if (ticket.type === "task") {
								taskEffortEstimation.push([ticket.estimatedTime, ticket.loggedTime]);
							}
						}
					});
				});

				var effortEstimation = {
					chart: {
						type: 'scatter'
					},
					title: {
						text: 'Effort vs. Estimation of Open Tickets by Type',
						style: {
							fontWeight: chartFontWeight,
							fontSize: chartFontSize
						}
					},
					xAxis: {
						allowDecimals: false,
						title: {
							enabled: true,
							text: 'Estimation (hrs.)'
						},
						startOnTick: true,
						endOnTick: true,
						showLastLabel: true,
						min: 0
					},
					yAxis: {
						title: {
							text: 'Effort (hrs.)'
						},
						min: 0
					},
					legend: {
						layout: 'vertical',
						align: 'left',
						verticalAlign: 'top',
						x: 60,
						y: 40,
						floating: true,
						backgroundColor: '#FFFFFF',
						borderWidth: 1
					},
					plotOptions: {
						scatter: {
							marker: {
								symbol: "circle",
								radius: 7,
								states: {
									hover: {
										enabled: true,
										lineColor: 'rgb(100,100,100)'
									}
								}
							},
							states: {
								hover: {
									marker: {
										enabled: false
									}
								}
							},
							tooltip: {
								headerFormat: '',
								pointFormat: '<strong>Est.:</strong> {point.x} hrs.<br><strong>Log.:</strong> {point.y} hrs.'
							}
						}
					},
					credits: {
						enabled: false
					},
					series: [
						{
							type: 'line',
							name: 'Regression',
							data: [[0, 0], [maxEstimation + 10, maxEstimation + 10]],
							color: '#555',
							marker: {
								enabled: false
							},
							states: {
								hover: {
									lineWidth: 0
								}
							},
							enableMouseTracking: false
						}, {
							name: 'Bugs',
							color: 'rgba(203, 31, 38, .5)',
							data: bugEffortEstimation

						}, {
							name: 'Tasks',
							color: 'rgba(33, 87, 157, .5)',
							data: taskEffortEstimation
						}
					]
				};

				res.json(effortEstimation);
			};
			usersService.getAllUsersCallback(callback);
			break;
		}
		case "assignedTickets":
		{
			var callback = function (users) {
				var data = [],
					ut = 0;

				_.each(users, function (user) {
					var ct = 0;
					_.each(user.tickets, function (ticket) {
						if (ticket.status !== "done") {
							if (ticket.owner === user.username) {
								ct++;
							} else if (ticket.owner !== undefined && !ticket.owner.length) {
								ut++;
							}
						}
					});
					data.push([user.username, ct]);
				});

				data.push(["unassigned", ut]);

				var assignedTickets = {
					chart: {
						plotBackgroundColor: null,
						plotBorderWidth: null,
						plotShadow: false
					},
					title: {
						text: 'Assigned Tickets',
						style: {
							fontWeight: chartFontWeight,
							fontSize: chartFontSize
						}
					},
					tooltip: {
						pointFormat: '{series.name}: <strong>{point.percentage:.1f}%</strong>'
					},
					plotOptions: {
						pie: {
							allowPointSelect: true,
							size: '100%',
							cursor: 'pointer',
							dataLabels: {
								enabled: false
							},
							showInLegend: true
						}
					},
					credits: {
						enabled: false
					},
					series: [{
						type: 'pie',
						name: 'Assigned tickets',
						data: data
					}]
				};

				res.json(assignedTickets);
			};
			usersService.getAllUsersCallback(callback);
			break;
		}
		default:
		{
			break;
		}
	}
};
