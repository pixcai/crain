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
            return String.fromCharCode(util.randInt(33, 126));
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

    Character.prototype.render = function(context, x, y) {
        context.font = context.font.replace(/\d+/, this.fontSize);
        context.fillStyle = this.fillStyle;
        context.clearRect(x - 8, y - this.fontSize, this.fontSize + 14, this.fontSize);
        context.fillText(util.randChar(), x, y);
    }

    function CharacterList(length, options) {
        util.assign(this, util.assign({
            fontSize: 16,
            speed: 60,
            gradientStop: '#ffffff00',
            gradientStart: '#00ff00ff'
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

    CharacterList.prototype.render = function(canvas, x, y) {
        var fontSize = this.fontSize,
            length = this.characteries.length;

        (function(characterList) {
            var context = canvas.getContext('2d');

            function renderCharacterByIndex(n) {
                window.requestAnimationFrame(function() {
                    characterList.characteries[n].render(
                        context, x, y - fontSize * (n + 1)
                    );
                });
            }

            characterList.characteries.forEach(function(character, i) {
                (function(n) {
                    setTimeout(function() {
                        renderCharacterByIndex(n);
                    }, characterList.speed);
                })(i);
            });

            if (y - length * fontSize < canvas.height) {
                setTimeout(function() {
                    characterList.render(canvas, x, y + fontSize);
                    (function(p) {
                        var characteries = characterList.characteries;

                        if (p < 0.1 || p > 0.9) {
                            for (var i = 0; i < length; i++) {
                                (function(n) {
                                    setTimeout(function() {
                                        characteries[n].fillStyle =
                                            (n === length - 1) ? 'rgba(0,0,0,0)' :
                                            characteries[n + 1].fillStyle;
                                    }, characterList.speed);
                                })(i);
                            }
                        }
                    })(Math.random());
                }, characterList.speed);
            }
        })(this);
    }

    function CharacterRain(amount) {
        util.assign(this, {
            canvas: util.createCanvas({
                width: window.innerWidth,
                height: window.innerHeight
            }),
            amount: amount || util.randInt()
        });
        var context = this.canvas.getContext('2d');

        context.textBaseline = 'top';
        context.shadowBlur = 10;
        context.shadowColor = 'lightgreen';
    }

    CharacterRain.prototype.render = function(speed) {
        var characterLists = [];

        for (var i = 0; i < this.amount; i++) {
            characterLists.push(
                new CharacterList(util.randInt(3, 26))
            );
        }

        (function(characterRain) {
            characterLists.forEach(function(characterList) {
                setTimeout(function() {
                    characterList.render(
                        characterRain.canvas,
                        util.randInt(0, characterRain.canvas.width),
                        util.randInt(0, characterRain.canvas.height / 2)
                    );
                }, util.randInt(0, speed));
            });

            setTimeout(function() {
                characterRain.render(speed);
            }, util.randInt(speed * 0.5, speed * 1.5));
        })(this);
    }

    new CharacterRain(util.randInt(8, 12)).render(3000);

})(document, window)
