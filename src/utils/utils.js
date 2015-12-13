/**
 * Retrieves week number for a provided date. Based on information at:
 *
 *    http://www.merlyn.demon.co.uk/weekcalc.htm#WNR
 */
exports.getWeekNumber = function (d) {
	var temp = new Date(d.getTime());
	temp.setHours(0, 0, 0);
	temp.setDate(temp.getDate() + 4 - (temp.getDay() || 7));
	return Math.ceil((((temp - new Date(temp.getFullYear(), 0, 1)) / 8.64e7) + 1) / 7);
};
