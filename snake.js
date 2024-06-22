const GRIDSCALE = 10;

class Snake {
    constructor(__name = "rip", __parts = [], __width = 5 / 10, __curve = -1) {
        // Argument checks
        if (!(0 < __width <= 1))
            throw `New snake "${__name}" got incorrect width "${__width}".`;
        if (__curve != -1 && !(0 <= __curve <= (1 - __width) / 2))
            throw `New snake "${__name}" with width of "${__width}" got incorrect curve size "${__curve}"`;

        this.name = __name;
        this.parts = __parts;
        this.halfWidth = GRIDSCALE * __width / 2;
        this.curve = GRIDSCALE * (__curve == -1 ? (0.5 - this.halfWidth) : __curve);
    }
    Append(point) {
        // if (this.parts.length != 0
        //     && this.parts[0]) return;
        this.parts.push(point);
    }
    Update() {
        if (this.parts.length <= 2) throw "snake is to small!";

        var _snakeSVG = $('<svg id="" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 0 0"><defs><style>.cls-1 {fill: #fff0;stroke: #000000;}.cls-2 {fill: #fff0;stroke: #ff0000;}</style></defs></svg>');
        _snakeSVG.attr("id", `snake-${this.name}-svg`);
        var _snakeSVGBody = $("<g></g>");

        var pathA = "";
        var pathB = "";

        for (let index = 0; index < this.parts.length; index++) {
            var _thisPointCenterX = this.parts[index][0] * GRIDSCALE + GRIDSCALE / 2,
                _thisPointCenterY = this.parts[index][1] * GRIDSCALE + GRIDSCALE / 2;

            // First segment
            if (index == 0) {

                // Center start
                pathA += `M${_thisPointCenterX},${_thisPointCenterY}`;


                var _dxFrontPath = this.parts[index + 1][0] - this.parts[index][0],
                    _dyFrontPath = this.parts[index + 1][1] - this.parts[index][1];

                pathA += `h${-_dyFrontPath * this.halfWidth}v${_dxFrontPath * this.halfWidth}`;
                pathB = `H${_thisPointCenterX + _dyFrontPath * this.halfWidth
                    }V${_thisPointCenterY - _dxFrontPath * this.halfWidth
                    }` + pathB;

                // Center end
                pathB += `H${_thisPointCenterX}V${_thisPointCenterY}`;
            }

            // Last segment
            else if (index == this.parts.length - 1) {
                var _dxBackPath = this.parts[index][0] - this.parts[index - 1][0],
                    _dyBackPath = this.parts[index][1] - this.parts[index - 1][1];

                pathA += `H${_thisPointCenterX - _dyFrontPath * this.halfWidth
                    }V${_thisPointCenterY + _dxFrontPath * this.halfWidth
                    }`;
                pathB = `H${_thisPointCenterX + _dyFrontPath * this.halfWidth
                    }V${_thisPointCenterY - _dxFrontPath * this.halfWidth
                    }` + pathB;
            }
            // Middle segments
            else {
                var _dxFrontPath = this.parts[index + 1][0] - this.parts[index][0],
                    _dyFrontPath = this.parts[index + 1][1] - this.parts[index][1];
                var _dxBackPath = this.parts[index][0] - this.parts[index - 1][0],
                    _dyBackPath = this.parts[index][1] - this.parts[index - 1][1];

                // strait path - no points needed
                if (_dxBackPath == _dxFrontPath != 0 || _dyBackPath == _dyFrontPath != 0)
                    continue;


                var _isHorizontal = _dxBackPath != 0;
                var _isClockwise = (_dxFrontPath + _dxBackPath) * (_dyFrontPath - _dyBackPath) > 0;

                pathA +=
                    // Straight
                    (_isHorizontal ? 'H' : 'V') + (
                        (_isHorizontal ? _thisPointCenterX : _thisPointCenterY)
                        + ((this.halfWidth + this.curve * (_isClockwise ? 1 : -1)) * (_isClockwise == (_dxBackPath > 0 || _dyBackPath > 0) ? -1 : 1))
                    )
                    // Curve
                    + `q${(_dxBackPath < 0 ? "-" : "") + (_dyFrontPath != 0 ? this.curve : 0)
                    }${(_dyBackPath < 0 ? "-" : ",") + (_dxFrontPath != 0 ? this.curve : 0)
                    }${(_dxBackPath < 0 || _dxFrontPath < 0 ? "-" : ",") + this.curve
                    }${(_dyBackPath < 0 || _dyFrontPath < 0 ? "-" : ",") + this.curve
                    }`;
                pathB = (_isHorizontal ? 'V' : 'H') + (
                    (_isHorizontal ? _thisPointCenterY : _thisPointCenterX)
                    + ((this.halfWidth - this.curve * (_isClockwise ? 1 : -1)) * (_isClockwise == (_dxFrontPath > 0 || _dyFrontPath > 0) ? -1 : 1))
                )
                    + `q${(_dxFrontPath > 0 ? "-" : "") + (_dyBackPath != 0 ? this.curve : 0)
                    }${(_dyFrontPath > 0 ? "-" : ",") + (_dxBackPath != 0 ? this.curve : 0)
                    }${(_dxFrontPath > 0 || _dxBackPath > 0 ? "-" : ",") + this.curve
                    }${(_dyFrontPath > 0 || _dyBackPath > 0 ? "-" : ",") + this.curve
                    }`
                    + pathB;
            }
        }

        _snakeSVGBody.append('<path class="cls-1" d="' + pathA + pathB + '"/>')
        _snakeSVG.attr("viewBox", "0 0 100 100"); // todo: correct size

        _snakeSVGBody.appendTo(_snakeSVG);

        $("#snakes").append(_snakeSVG);


        $("#snakes").html($("#snakes").html())
    }
};

$(() => {
    s = new Snake("AA",
        [
            [1, 1],
            [1, 0],
            [0, 0],
            [0, 1],
            [0, 2],
            [1, 2],
            [2, 2],
            [2, 1],
            [2, 0],
            [3, 0],
            [3, 1],
            [3, 2],
            [3, 3],
            [3, 4],
            [2, 4],
            [1, 4],
            [0, 4],
            [0, 3],
            [1, 3],
            [2, 3]
        ],
        4 / 10,
        -1
    );
    s.Update();
})