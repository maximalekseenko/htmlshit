const GRIDSCALE = 10;

class Snake {
    constructor(
        __name = "rip",
        __segments = [],
        __width = 5 / 10,
        __curve = -1,
        __headMaker = -1,
        __segmentMaker = -1,
        __tailMaker = -1,
        __styles = -1
    ) {

        // Set name.
        this.name = __name;

        // Set Segments.
        this.segments = [];
        __segments.forEach(_segment => this.Append(_segment));

        // Set width (half width) and curve.
        this.SetWidthAndCurve(__width, __curve);

        // Set Styles.
        this.styles = this.styles;

        // Set maker functions.
        this.headMaker;
        this.segmentMaker;
        this.tailMaker;
    }


    SetWidthAndCurve(__newWidth, __newCurve) {

        // Check arguments.
        if (!(0 < __newWidth <= 1))
            throw `Snake "${this.name}" got incorrect width "${__newWidth}".`;
        if (__newCurve != -1 && !(0 <= __newCurve <= (1 - __newWidth) / 2))
            throw `New snake "${this.name}" with width of "${__newWidth}" got incorrect curve size "${__curve}"`;

        // Set
        this.width = GRIDSCALE * __newWidth;
        this._halfWidth = GRIDSCALE * __newWidth / 2;
        this.curve = GRIDSCALE * (__newCurve == -1 ? (1 - __newWidth) / 2 : __newCurve);
    }


    Append(point) {
        // if (this.segments.length != 0
        //     && this.segments[0]) return;
        this.segments.push(point);
    }


    Pop() {

    }


    BodyMaker() {
        // Main idea here is to make two paths, parallel around the central "core" path, 
        // and than connect them, forming a snake-width thick figure around "core" path,
        // to achieve this in one cycle,
        // first path is drawn normally,
        // while the second one is reversed.

        // for a snake going down:
        // Path A is a left side;
        // Path B is a right side.
        var pathA = "",
            pathB = "";

        // Iterate through segments.
        for (let index = 0; index < this.segments.length; index++) {

            // Central point of current segment.
            var _thisPointCenterX = this.segments[index][0] * GRIDSCALE + GRIDSCALE / 2,
                _thisPointCenterY = this.segments[index][1] * GRIDSCALE + GRIDSCALE / 2;

            // If first segment.
            if (index == 0) {

                // Get Front and/or Back paths.
                var _dxFrontPath = this.segments[index + 1][0] - this.segments[index][0],
                    _dyFrontPath = this.segments[index + 1][1] - this.segments[index][1];

                // Center start
                pathA += `M${_thisPointCenterX},${_thisPointCenterY}`;

                // Move paths out of center to body width;
                // vertical or horizontal doesn't matter - the second one will be zero.
                pathA += `h${-_dyFrontPath * this._halfWidth
                    }v${_dxFrontPath * this._halfWidth
                    }`;
                pathB = `H${_thisPointCenterX + _dyFrontPath * this._halfWidth
                    }V${_thisPointCenterY - _dxFrontPath * this._halfWidth
                    }` + pathB;

                // Center end.
                pathB += `H${_thisPointCenterX}V${_thisPointCenterY}`;
            }

            // If last segment.
            else if (index == this.segments.length - 1) {

                // Get Front and/or Back paths.
                var _dxBackPath = this.segments[index][0] - this.segments[index - 1][0],
                    _dyBackPath = this.segments[index][1] - this.segments[index - 1][1];

                // Move paths from body width into center;
                // vertical or horizontal doesn't matter - the second one will be zero.
                pathA += `H${_thisPointCenterX - _dyFrontPath * this._halfWidth
                    }V${_thisPointCenterY + _dxFrontPath * this._halfWidth
                    }`;
                pathB = `H${_thisPointCenterX + _dyFrontPath * this._halfWidth
                    }V${_thisPointCenterY - _dxFrontPath * this._halfWidth
                    }` + pathB;
            }

            // If middle segments.
            else {

                // Get Front and/or Back paths.
                var _dxFrontPath = this.segments[index + 1][0] - this.segments[index][0],
                    _dyFrontPath = this.segments[index + 1][1] - this.segments[index][1];
                var _dxBackPath = this.segments[index][0] - this.segments[index - 1][0],
                    _dyBackPath = this.segments[index][1] - this.segments[index - 1][1];

                // Skip segment if its is not a corner one.
                if (_dxBackPath == _dxFrontPath != 0 || _dyBackPath == _dyFrontPath != 0)
                    continue;

                // If came from horizontal movement.
                var _isHorizontal = _dxBackPath != 0;

                // Is this corner segment is rotated clockwise.
                var _isClockwise = (_dxFrontPath + _dxBackPath) * (_dyFrontPath - _dyBackPath) > 0;

                // Move paths for this segment;
                // To reduce size of path, it make ether vertical or horizontal move.
                pathA +=
                    // Make a straight move.
                    (_dxBackPath != 0 ? 'H' : 'V') + (
                        (_dxBackPath != 0 ? _thisPointCenterX : _thisPointCenterY)
                        + ((this._halfWidth + this.curve * (_isClockwise ? 1 : -1)) * (_isClockwise == (_dxBackPath > 0 || _dyBackPath > 0) ? -1 : 1))
                    )
                    // Make a Bezier curve.
                    + `q${(_dxBackPath < 0 ? "-" : "") + (_dyFrontPath != 0 ? this.curve : 0)
                    }${(_dyBackPath < 0 ? "-" : ",") + (_dxFrontPath != 0 ? this.curve : 0)
                    }${(_dxBackPath < 0 || _dxFrontPath < 0 ? "-" : ",") + this.curve
                    }${(_dyBackPath < 0 || _dyFrontPath < 0 ? "-" : ",") + this.curve
                    }`;
                pathB =
                    // Make a straight move.
                    (_dxFrontPath != 0 ? 'H' : 'V') + (
                        (_dxFrontPath != 0 ? _thisPointCenterX : _thisPointCenterY)
                        + ((this._halfWidth - this.curve * (_isClockwise ? 1 : -1)) * (_isClockwise == (_dxFrontPath > 0 || _dyFrontPath > 0) ? -1 : 1))
                    )
                    // Make a Bezier curve.
                    + `q${(_dxFrontPath > 0 ? "-" : "") + (_dyBackPath != 0 ? this.curve : 0)
                    }${(_dyFrontPath > 0 ? "-" : ",") + (_dxBackPath != 0 ? this.curve : 0)
                    }${(_dxFrontPath > 0 || _dxBackPath > 0 ? "-" : ",") + this.curve
                    }${(_dyFrontPath > 0 || _dyBackPath > 0 ? "-" : ",") + this.curve
                    }`
                    + pathB;
            }
        }

        // Finish body and return
        return $("<g></g>").append(`<path class="snake-${this.name}-svg-body" d="${pathA}${pathB}"/>`);
    }
    Update() {
        if (this.segments.length <= 2) throw "snake is to small!";

        var _snakeSVG = $(`<svg></svg>`);
        var _snakeDIV = $(`<div></div>`)
            .attr(`id`, `snake-${this.name}-div`)
            .html("").append(_snakeSVG).appendTo($("#snakes"));

        // Set attributes to svg
        _snakeSVG.attr(`id`, `snake-${this.name}-svg`);
        _snakeSVG.attr(`xmlns`, `http://www.w3.org/2000/svg`);
        _snakeSVG.attr(`viewBox`, `0 0 100 100`);
        //     + `viewBox="0 0 100 100"> `
        // _snakeSVG.attr(`id`, `snake-${this.name}-svg`);
        //     + `<defs><style>${this.styles}</style></defs>`
        //     + `</svg>`
        // );

        // // Generate body
        _snakeSVG.append(this.BodyMaker());

        // Add to screen and refresh
        _snakeDIV.html(_snakeDIV.html());
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
        6 / 10
    );
    s.Update();
})