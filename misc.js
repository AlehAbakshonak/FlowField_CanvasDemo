function distanceBetweenPoints(pointA, pointB) {
	return Math.hypot(pointB.x - pointA.x, pointB.y - pointA.y);
}

function getIndex(array, i) {
	if (i < 0) i = array.length + i
	return i % array.length;
}

function movePointAtAngle(point, angle, distance) {
	point.x += Math.cos(angle) * distance;
	point.y += Math.sin(angle) * distance;
}

function getAngle(pointA, pointB) {
	return Math.atan2((pointB.y - pointA.y), pointB.x - pointA.x);
}

// let round = (n, decimals) => {
// 	let multiplier = Math.pow(10, decimals);
// 	return Math.round(n * multiplier) / multiplier;
// }

function avg(...arg) {
	arg = arg.flat(1);
	return sumArgs(arg) / arg.length;
}

function sumArgs(...arg) {
	arg = arg.flat(1);
	let sum = 0;
	for (let i = 0; i < arg.length; i++) {
		sum += parseFloat(arg[i]);
	}
	return sum;
}

function rotatePointAroundAxis(point, axis, angle) {
	let dx = point.x - axis.x;
	let dy = point.y - axis.y;
	point.x = axis.x + dx * Math.cos(angle) - dy * Math.sin(angle);
	point.y = axis.y + dx * Math.sin(angle) + dy * Math.cos(angle);
}

function rotatePointArrayAroundAxis(pointArr, axis, angle) {
	for (let i = 0; i < pointArr.length; i++) {
		rotatePointAroundAxis(pointArr[i], axis, angle);
	}
}

let debug_timers = true;
let timers = {};
let prevTime = 0;

let countTimer = (name) => {
	if (!debug_timers) return;
	let nowTime = performance.now();
	let currentValue;
	if (timers[name] === undefined) {
		currentValue = 0;
	}
	else {
		currentValue = timers[name].ms;
	}
	Object.defineProperty(timers, name, {
		value: {
			ms: round((currentValue + nowTime - prevTime) * 1000) / 1000, percents: 0,
		}, writable: true, enumerable: true,
	});
	prevTime = nowTime;
};

let printTimers = () => {
	if (!debug_timers) return;
	let totalTime = performance.now();
	let tableTime = 0;
	Object.keys(timers).forEach(function (key) {
		timers[key].percents = round((timers[key].ms / totalTime) * 100, 2);
		tableTime += timers[key].ms;
	});
	console.table(timers);
	console.log(`Table time: ${round(tableTime, 2)} ms;   ` + `Total time: ${round(totalTime, 2)} ms`);
};