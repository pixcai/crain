(function (document, window) {
	function createCanvas(attrs) {
		var canvasElement = document.createElement('canvas');

		for (var attr in attrs) {
			canvasElement.setAttribute(attr, attrs[attr]);
		}
		document.body.appendChild(canvasElement);

		return canvasElement;
	}

	function assignObject(obj, val) {
		for (var key in val) {
			if (Object.prototype.toString.call(val[key]) === '[object Object]' && obj[key]) {
				assignObject(obj[key], val[key]);
			}
			else {
				obj[key] = val[key];
			}
		}
	}

	var canvasOptions = {
		width: window.innerWidth,
		height: window.innerHeight
	};

	var CharacterRain = (function (canvas) {
		return function (options) {
			this.context = canvas.getContext('2d');
			assignObject(this, options);
		}
	})(createCanvas(canvasOptions));

	CharacterRain.prototype.render = function () {
		setTimeout(function () {
			window.requestAnimationFrame(function () {
				window.characterRain.render()
			});
		}, 240);
	}

	window.characterRain = new CharacterRain({
		x: 0,
		y: 0,
		speed: 80,
		context: {
			font: '22px Courier',
		},
		stopColor: 0x00ff00,
		startColor: 0xffffff,
		range: {
			min: 6, 
			max: 24
		}
	});

	window.requestAnimationFrame(function () {
		window.characterRain.render();
	});
})(document, window)