(function () {
    var _lastColor = null,
        _currentColor,

        _lastBlock = null,
        _currentBlock,

        _currentPath = {},

        _isTracing = false,

        _size,
        _moves = 0,

        _itemsOk = [],
        _level = null,

        _init = function () {
            levels = [
                'a3ab4c1cb9d4efdef3',
                'dea3d3e1c5b2b2c5ffa3',
                'a5f3f3c3b2b2edc3e1da2',
                '5e7bdba2f1ac2fd7ce',
                'a6b2e2ce8d1bc1dfa3f1',
                '3f3c4d1ca4b1d2a2e2be2f',
                '7d2c2b6c2ae1dfb2ef1a1',
                'ba2de1b4cc3f7d5ae2f',
                '1fa7c3b2b3c1d1e2a1f1ed2'
            ]

            _level = levels[Math.floor(Math.random() * levels.length)];
            _loadLevel(_level);
            inicio();
        },
        _nextLevel = function () {
            const index = levels.indexOf(_level);
            if (index > -1) {
                levels.splice(index, 1);
            }

            var element = document.getElementsByClassName("nivel-actual");
            element[0].innerHTML = `&nbsp;Nivel ${(10 - levels.length)}/${10}`;

            if (levels.length > 0) {
                _level = levels[Math.floor(Math.random() * levels.length)];
                _loadLevel(_level);
            } else {
                var grid = document.querySelector('.grid');
                grid.remove();
                parar();
            }
        },
        _loadLevel = function (s) {
            console.log(s);
            var data = [];

            while (s.length) {
                s = s.replace(/^\d+|[a-z]/i, function (x) {
                    if (parseInt(x)) {
                        while (x--) {
                            data.push(0);
                        }
                    }
                    else {
                        data.push(parseInt(x, 36) - 9);
                    }

                    return '';
                });
            }

            var grid = document.querySelector('.grid'),
                size = Math.sqrt(data.length);

            if (size !== parseInt(size)) {
                // throw 'Invalid grid definition.'; //
                console.error('Invalid grid definition.');

                return;
            }
            else {
                grid.setAttribute('data-size', size);
            }

            grid.innerHTML = '';

            data.forEach(function (n) {
                var block = document.createElement('div');
                if (n) {
                    block.setAttribute('data-id', n);
                    block.setAttribute('data-point', 'true');

                    var img = document.createElement("img");
                    img.width = "45";
                    switch (n) {
                        case 1:
                            img.src = "..//images/flow-free/petrolero.png";
                            break;
                        case 2:
                            img.src = "..//images/flow-free/gas.png";
                            break;
                        case 3:
                            img.src = "..//images/flow-free/plataforma-marina.png";
                            break;
                        case 4:
                            img.src = "..//images/flow-free/quimico.png";
                            break;
                        case 5:
                            img.src = "..//images/flow-free/torre-de-aceite.png";
                            break;
                        case 6:
                            img.src = "..//images/flow-free/tuberia-de-gas.png";
                            break;

                    }
                    //block.appendChild(img);
                }

                grid.appendChild(block);
            });

            //var grid = document.querySelector('.grid');

            _size = parseInt(grid.getAttribute('data-size'));

            Array.from(grid.querySelectorAll('div')).forEach(function (block, i) {
                var colorId = parseInt(block.getAttribute('data-id')),
                    isPoint = block.getAttribute('data-point') === 'true';

                block.setAttribute('data-i', i);

                if ('ontouchstart' in document) {
                    console.info('ontouchstart');
                    block.addEventListener('touchstart', _mouseDownHandler, false);
                    block.addEventListener('touchmove', _mouseMoveHandler, false);
                    block.addEventListener('touchend', _mouseUpHandler, false);
                }
                else {
                    block.addEventListener('mousedown', _mouseDownHandler, false);
                    block.addEventListener('mousemove', _mouseMoveHandler, false);
                    block.addEventListener('mouseup', _mouseUpHandler, false);
                }
            });
        },
        _isNeighbour = function (i, j) {
            var x = (i % _size) - (j % _size),
                y = Math.floor(i / _size) - Math.floor(j / _size);

            if (x === -1 && y === 0) {
                return 'l';
            }
            else if (x === 1 && y === 0) {
                return 'r';
            }
            else if (x === 0 && y === -1) {
                return 't';
            }
            else if (x === 0 && y === 1) {
                return 'b';
            }

            return false;

            // return (Math.abs(point1.x - point2.x) === 1 && Math.abs(point1.y - point2.y) === 0) ||
            //     (Math.abs(point1.x - point2.x) === 0 && Math.abs(point1.y - point2.y) === 1);
        },
        _cleanAll = function (items, limit) {
            if (!items.length) {
                return [];
            }

            var colorId = items[0].getAttribute('data-id');
            Array.from(document.querySelector('.grid').querySelectorAll('div[data-id="' + colorId + '"]')).forEach(function (block) {
                block.removeAttribute('data-completed');
                var index = _itemsOk.indexOf(block.getAttribute('data-id'));
                if (index > -1) {
                    _itemsOk.splice(index, 1);
                }
            });

            limit = limit || 1;

            if (items && items.length) {
                while (items.length > limit) {
                    var block = items.pop(),
                        previousBlock = items[items.length - 1],
                        direction = _isNeighbour(previousBlock.getAttribute('data-i'), block.getAttribute('data-i'));

                    if (block.getAttribute('data-point') !== 'true') {
                        block.removeAttribute('data-id');
                    }

                    block.removeAttribute('data-' + direction);
                    previousBlock.removeAttribute('data-' + ({ t: 'b', b: 't', l: 'r', r: 'l' }[direction]));
                }
            }

            if (items.length === 1) {
                items.pop();
            }

            return items;
        },
        _mouseDownHandler = function (event) {
            // DEBOUNCE
            var colorId = parseInt(this.getAttribute('data-id'));

            if (!colorId) {
                return;
            }

            if (event.type.match(/^mouse/) && event.which !== 1) {
                return;
            }

            if (_currentColor !== _lastColor) {
                _moves++;
            }

            _lastColor = _currentColor;
            _currentColor = colorId;

            //console.log(`nivel: ${_level}, color: ${colorId}`);

            if (_currentBlock !== event.target) {
                _lastBlock = _currentBlock;
                _currentBlock = event.target;

                if (_currentBlock.getAttribute('data-point') === 'true') {
                    if (_currentPath[_currentColor]) {
                        _currentPath[_currentColor] = _cleanAll(_currentPath[_currentColor]);
                    }
                    else {
                        _currentPath[_currentColor] = [];
                    }
                }
                else {
                    var pathIndex = _currentPath[_currentColor].indexOf(event.target);

                    if (pathIndex > -1) {
                        _currentPath[_currentColor] = _cleanAll(_currentPath[_currentColor], pathIndex + 1);
                        _lastBlock = _currentPath[_currentColor][_currentPath[_currentColor].length - 1];
                    }
                }

                _currentPath[_currentColor].push(_currentBlock);
            }

            _isTracing = true;

            event.preventDefault();
        },
        _mouseMoveHandler = function (event) {
            if (!_isTracing) {
                return;
            }

            var newBlock = event.target;

            if (event.type.match(/^touch/)) {
                newBlock = document.elementFromPoint(event.touches[0].pageX, event.touches[0].pageY);

                if (!newBlock) {
                    return;
                }
            }

            if (!_currentBlock) {
                console.log('no current block');
                return;
            }

            if (newBlock !== _currentBlock) {
                var matchDirection = _isNeighbour(_currentBlock.getAttribute('data-i'), newBlock.getAttribute('data-i'));

                const _data = {
                    nivel: _level,
                    colorId: _currentBlock.getAttribute('data-id'),
                    cuadroN: newBlock.getAttribute('data-i'),
                    fecha: new Date()
                };

                if (matchDirection) {
                    //console.log('match...', _data);

                    var newColor = newBlock.getAttribute('data-id'),
                        isPoint = newBlock.getAttribute('data-point') === 'true';

                    if (newColor == _currentColor) {
                        var pathIndex = _currentPath[_currentColor].indexOf(newBlock);

                        if (pathIndex > -1) {
                            _currentPath[_currentColor] = _cleanAll(_currentPath[_currentColor], pathIndex + 1);
                            _currentBlock = _currentPath[_currentColor][_currentPath[_currentColor].length - 1];
                            _lastBlock = _currentPath[_currentColor][_currentPath[_currentColor].length - 2];
                        }
                        else {
                            if (isPoint) {
                                _lastBlock = _currentBlock;
                                _currentBlock = newBlock;
                                _currentPath[_currentColor].push(_currentBlock);

                                _currentPath[_currentColor].forEach(function (block) {
                                    block.setAttribute('data-completed', 'true');

                                    const colorId = block.getAttribute('data-id');
                                    if (isNumeric(colorId)) {
                                        if (_itemsOk.indexOf(colorId) === -1) {
                                            _itemsOk.push(colorId);
                                        }
                                    }

                                    if (_itemsOk.length === 6) {
                                        console.clear();
                                        console.log("OK: ", _itemsOk);
                                        _nextLevel();
                                        _itemsOk = []; // clean answers
                                    }
                                });

                                _currentBlock.setAttribute('data-id', _currentColor);
                                //_currentBlock.setAttribute('data-id', (_currentColor + 'x' + _currentColor));
                                _currentBlock.setAttribute('data-' + matchDirection, '');
                                _lastBlock.setAttribute('data-' + ({ t: 'b', b: 't', l: 'r', r: 'l' }[matchDirection]), '');
                            }
                            else {
                                console.log('here: ' + _currentPath[_currentColor].length);
                                console.log(_currentPath[_currentColor]);
                            }
                        }
                    }
                    else if (!newColor) {
                        if (_currentBlock.getAttribute('data-point') && _currentPath[_currentColor].length > 1) {
                            return;
                        }
                        else {
                            _lastBlock = _currentBlock;
                            _currentBlock = newBlock;

                            //_currentBlock.setAttribute('data-id', _currentColor);
                            _currentBlock.setAttribute('data-id', (_currentColor + 'x' + _currentColor));
                            _currentBlock.setAttribute('data-' + matchDirection, '');
                            _lastBlock.setAttribute('data-' + ({ t: 'b', b: 't', l: 'r', r: 'l' }[matchDirection]), '');
                            _currentPath[_currentColor].push(_currentBlock);
                        }
                    }
                } else {
                    const index = _itemsOk.indexOf(_currentBlock.getAttribute('data-id'));
                    if (index > -1) {
                        _itemsOk.splice(index, 1);
                    }

                    var grid = document.querySelector('.grid');
                    Array.from(grid.querySelectorAll('div')).forEach(function (block, i) {
                        var colorId = block.getAttribute('data-id');
                        const completed = block.getAttribute('data-completed');
                        if (completed) {
                            if (isNumeric(colorId)) {
                                if (_itemsOk.indexOf(colorId) === -1) {
                                    _itemsOk.push(colorId);
                                }
                            }
                        }
                    });
                }
            }

            event.preventDefault();
        },
        _mouseUpHandler = function (event) {
            if (!_isTracing) {
                return;
            }

            _isTracing = false;

            event.preventDefault();
        };
    _init();
})();


var centesimas = 0;
var segundos = 0;
var minutos = 5;
var horas = 0;

function inicio() {
    control = setInterval(cronometro, 10);
    //document.getElementById("inicio").disabled = true;
    //document.getElementById("parar").disabled = false;
    //document.getElementById("continuar").disabled = true;
    //document.getElementById("reinicio").disabled = false;
}

function parar() {
    clearInterval(control);
    //document.getElementById("parar").disabled = true;
    //document.getElementById("continuar").disabled = false;
}

function reinicio() {
    clearInterval(control);
    centesimas = 0;
    segundos = 0;
    minutos = 0;
    horas = 0;
    Centesimas.innerHTML = ":00";
    Segundos.innerHTML = ":00";
    Minutos.innerHTML = ":00";
    Horas.innerHTML = "00";
    document.getElementById("inicio").disabled = false;
    document.getElementById("parar").disabled = true;
    document.getElementById("continuar").disabled = true;
    document.getElementById("reinicio").disabled = true;
}

function cronometro() {
    if (centesimas < 99) {
        centesimas++;
        if (centesimas < 10) { centesimas = "0" + centesimas }
        Centesimas.innerHTML = ":" + centesimas;
    }
    if (centesimas == 99) {
        centesimas = -1;
    }
    if (centesimas == 0) {
        segundos++;
        if (segundos < 10) { segundos = "0" + segundos }
        Segundos.innerHTML = ":" + segundos;
    }
    if (segundos == 59) {
        segundos = -1;
    }
    if ((centesimas == 0) && (segundos == 0)) {
        minutos++;
        if (minutos < 10) { minutos = "0" + minutos }
        Minutos.innerHTML = ":" + minutos;
    }
    if (minutos == 59) {
        minutos = -1;
    }
    if ((centesimas == 0) && (segundos == 0) && (minutos == 0)) {
        horas++;
        if (horas < 10) { horas = "0" + horas }
        Horas.innerHTML = horas;
    }
}

function isNumeric(value) {
    return /^-?\d+$/.test(value);
}