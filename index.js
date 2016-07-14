(function(document, window) {
    var util = {
        createCanvas: function createCanvas(props) {
            var canvas = document.createElement('canvas');

            if (props) {
                for (var prop in props) {
                    canvas.setAttribute(prop, props[prop]);
                }
            }
            document.body.appendChild(canvas);

            return canvas;
        },
        gradientColor: function gradientColor(startHexColor, stopHexColor, step) {
            function hexToRgba(hex) {
                return (function(rgba) {
                    for (var i = 1; i < 8; i += 2) {
                        rgba.push(parseInt('0x' + hex.slice(i, i + 2)));
                    }
                    return rgba;
                })([]);
            }

            return (function(gradientArray) {
                var stopRgbaColor = hexToRgba(stopHexColor),
                    startRgbaColor = hexToRgba(startHexColor),
                    rStep = (stopRgbaColor[0] - startRgbaColor[0]) / step,
                    gStep = (stopRgbaColor[1] - startRgbaColor[1]) / step,
                    bStep = (stopRgbaColor[2] - startRgbaColor[2]) / step,
                    aStep = (stopRgbaColor[3] - startRgbaColor[3]) / step;

                for (var i = 0; i < step; i++) {
                    gradientArray.push('rgba('.concat(
                        parseInt(rStep * i + startRgbaColor[0]), ',',
                        parseInt(gStep * i + startRgbaColor[1]), ',',
                        parseInt(bStep * i + startRgbaColor[2]), ',',
                        parseInt(aStep * i + startRgbaColor[3]) / 0xff, ')'));
                }

                return gradientArray;
            })([]);
        },
        randChar: function randChar() {
            var validChar = 'abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ~!@#$%^&*()-=+{}[]<>?/\\';

            return validChar[util.randInt(0, validChar.length - 1)];
        },
        randInt: function randInt(min, max) {
            if (min === undefined && max === undefined) {
                return Math.round(Math.random() * 100);
            }

            return Math.round(min + Math.random() * (max - min));
        },
        assign: function assign(target, source) {
            if (isObject(source)) {
                for (var key in source) {
                    if (isObject(source[key]) && target.hasOwnProperty(key)) {
                        assign(target[key], source[key]);
                    } else {
                        target[key] = source[key];
                    }
                }
            }

            function isObject(value) {
                return value && Object.prototype.toString.call(value) === '[object Object]';
            }

            return target;
        }
    }

    function Character(options) {
        util.assign(this, options);
    }

    Character.prototype.render = function(context, options) {
        context.font = context.font.replace(/\d+/, this.fontSize);
        context.fillStyle = this.fillStyle;

        context.fillText(
        	util.randChar(), 
        	options.x, 
        	options.y + options.offset * this.fontSize
        );

        (function(character) {
            setTimeout(function() {
                window.requestAnimationFrame(function() {
                    character.render(context, options);
                });
            }, options.speed);
        })(this);
    }

    function CharacterList(length, options) {
        util.assign(this, util.assign({
            fontSize: 16,
            speed: 180,
            gradientStop: '#00ff00ff',
            gradientStart: '#ffffffff'
        }, options));
        this.rgbaList = util.gradientColor(
            this.gradientStart,
            this.gradientStop,
            length
        );
        this.characteries = [];

        for (var i = 0; i < length; i++) {
            (function(characterList) {
                characterList.characteries.push(
                    new Character({
                        fontSize: characterList.fontSize,
                        fillStyle: characterList.rgbaList[i]
                    })
                );
            })(this);
        }
    }

    CharacterList.prototype.render = function(canvas, options) {
        var characterList = this, 
        	context = canvas.getContext('2d');

        context.textBaseline = 'top';
        function renderCharacterByOffset(offset) {
            window.requestAnimationFrame(function() {
                characterList.characteries[offset].render(
                    context, {
                    	x: options.x,
                    	y: options.y,
                    	offset: offset,
                    	speed: characterList.speed
                    });
            });
        }

        characterList.characteries.forEach(function(character, i) {
            (function(offset) {
                setTimeout(function() {
                    renderCharacterByOffset(offset);
                }, characterList.speed * offset)
            })(i);
        });

        if (options.y < canvas.height) {
	        setTimeout(function () {
	        	options.y += characterList.fontSize;
	        	characterList.render(canvas, options);
	        }, characterList.speed);
        }
    }

    function CharacterRain(amount) {
        util.assign(this, {
            canvas: util.createCanvas({
                width: window.innerWidth,
                height: window.innerHeight
            }),
            characterLists: []
        });

        for (var i = 0, n = amount || util.randInt(1, this.canvas.width); i < n; i++) {
            (function(characterRain) {
                characterRain.characterLists.push(
                    new CharacterList(
                    	util.randInt(2, characterRain.canvas.height)
                    )
                );
            })(this);
        }
    }

    CharacterRain.prototype.render = function(speed) {
        (function(characterRain) {
            characterRain.characterLists.forEach(function(characterList) {
                setTimeout(function() {
                    characterList.render(characterRain.canvas, {
                        x: util.randInt(0, characterRain.canvas.width),
                        y: util.randInt(0, characterRain.canvas.height)
                    });
                }, util.randInt(0, speed));
            });

            setTimeout(function() {
                characterRain.render(speed);
            }, util.randInt(speed * 0.6, speed * 1.8));
        })(this);
    }

    new CharacterRain(util.randInt()).render(3000);

})(document, window)
