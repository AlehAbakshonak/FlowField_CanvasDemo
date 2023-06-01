let cnv;
let ctx;
let buffer;
let bufferCtx;

let points = [];
let pointAmt;
let totalNoiseScale, colorNoiseScale, angleNoiseScale, lifeTimeNoiseScale;
let hueOffset, hueRange;
let pointStep = 1.5;
let maxLifeTime, lifeTimeThreshold;
let tipSizeMult = 3;
let rootSize;

CanvasRenderingContext2D.prototype.drawLine = function (x1, y1, x2, y2) {
	this.beginPath();
	this.moveTo(x1, y1);
	this.lineTo(x2, y2);
	this.stroke();
}

function getHSL(h, s, l, a = 1) {
	return `hsla(${h},${s / 2.55}%,${l / 2.55}%,${a})`;
}

function currentNoise(x, y) {
	return avg(
		simplex2(x / totalNoiseScale, y / totalNoiseScale),
		simplex2(x / totalNoiseScale * 2, y / totalNoiseScale * 2)
	) / 2 + 0.5;
}

function setRandomParams() {
	hueOffset = random(50, 150);
	hueRange = random(4, 15) * 10;

	totalNoiseScale = random(50, 100);
	colorNoiseScale = random() > 0.5 ? random(0.2, 0.4) : random(2, 6);
	angleNoiseScale = random(0.1, 0.3);
	lifeTimeNoiseScale = random() > 0.6 ? random(0.2, 0.4) : random(15, 30);

	maxLifeTime = round(random(30, 50) * width / 550);
	lifeTimeThreshold = random(0.1, 0.4);

	rootSize = round(width / 90);
}

function setup() {
	cnv = createCanvas(round(windowWidth), round(windowWidth));
	buffer = createGraphics(width, height);
	ctx = cnv.drawingContext;
	bufferCtx = buffer.drawingContext;
	setRandomParams();

	pointAmt = 3000;

	ctx.fillStyle = getHSL(hueOffset + hueRange * 0.6, 100, 150);
	ctx.lineWidth = 0;
	ctx.fillRect(0, 0, width, height);

	for (let i = 0; i < pointAmt; i++) {
		let randX = round(random(50, width - 50));
		let randY = round(random(50, height - 50));
		let creationAttempt = createNewPoint(randX, randY);
		if (creationAttempt === false) {
			i--;
		}
	}
	points.sort((a, b) => a.y - b.y);

	frameRate(25);
}

function draw() {
	for (let i = 0; i < points.length; i++) {
		points[i].move();
		if (!points[i].alive) {
			points.splice(i, 1);
			i++;
		}
	}
	ctx.drawImage(buffer.canvas, 0, 0, width, height);
	bufferCtx.clearRect(0, 0, width, height);
}

function createNewPoint(x, y) {
	let heat = currentNoise(
		x * lifeTimeNoiseScale,
		y * lifeTimeNoiseScale);

	if (heat > lifeTimeThreshold +
		 random(-lifeTimeThreshold, lifeTimeThreshold) / 3) {
		let colorNoise = currentNoise(
			x * colorNoiseScale,
			y * colorNoiseScale);
		let currentColor = [
			colorNoise * hueRange + hueOffset,
			colorNoise * 50 + 150,
			abs(colorNoise - 0.5) * 150 + 100];

		//тут создается новая частица
		let newPoint = new Point(
			x, y,
			map(heat,
				lifeTimeThreshold * 0.1, 1,
				0, maxLifeTime, true),
			currentColor);
		points.push(newPoint);
		return newPoint;
	}
	else {
		return false;
	}
}

let globalPointID = 0;

class Point {
	constructor(x, y, lifeTime, col) {
		this.ID = globalPointID++;

		this.prevX = x;
		this.prevY = y;
		this.x = x;
		this.y = y;
		this.initY = this.y;

		this.angle = undefined;

		this.startR = rootSize; //стартовый радиус частицы
		this.endR = this.startR / tipSizeMult; //конечный радиус частицы
		this.age = 0;
		this.relativeAge = 0;
		this.lifeTime = lifeTime;
		this.color = col;
		this.alive = true;
	}

	move() {
		if (this.age % 2 === 0) {
			let angleCol = currentNoise(
				this.x * angleNoiseScale,
				this.y * angleNoiseScale);
			this.angle = angleCol * TWO_PI;
		}
		this.age++;
		if (this.age < this.lifeTime) {
			this.relativeAge = this.age / this.lifeTime;
			this.prevX = this.x;
			this.prevY = this.y;
			this.x += sin(this.angle) * pointStep;
			this.y += cos(this.angle) * pointStep;
			this.display();
		}
		else {
			this.alive = false;
		}
	}

	display() {
		let r = map(
			this.relativeAge,
			0, 1,
			this.startR, this.endR);

		let shadowAlpha = map(
			abs(this.y - this.initY),
			0, this.lifeTime,
			24, -3, true);
		bufferCtx.strokeStyle =
			getHSL(0, 0, 0, shadowAlpha / 255);
		bufferCtx.lineWidth = r;

		bufferCtx.drawLine(
			this.x, this.y,
			this.x,
			this.y + map(this.relativeAge,
						 0,
						 1,
						 abs(this.y - this.initY),
						 abs(this.y - this.initY) * 0.85));


		let grad = bufferCtx.createLinearGradient(
			this.x, min(this.y, this.prevY) - r,
			this.x, max(this.y, this.prevY) + r);

		grad.addColorStop(
			0,
			getHSL(
				this.color[0] + this.age,
				this.color[1] - 75 + this.relativeAge * 50,
				this.color[2] / 2 + 25 + this.relativeAge * 150, 10));
		grad.addColorStop(
			map(this.relativeAge,
				0, 1,
				0.1, 0.65, true),
			getHSL(
				this.color[0],
				this.color[1],
				this.color[2]));
		grad.addColorStop(
			1,
			getHSL(
				this.color[0],
				this.color[1] + 25 + this.relativeAge * 50,
				this.color[2] / 2 - 125 + this.relativeAge * 100));

		bufferCtx.lineWidth = r;
		bufferCtx.strokeStyle = grad;
		bufferCtx.drawLine(
			this.x, this.y,
			this.prevX, this.prevY);
	}
}