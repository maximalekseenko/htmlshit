const GRIDSCALE = 10;
const GRIDROWS = 10;
const GRIDCOLS = 10;

class Snake {
    constructor(
        __name = "rip",
        __segments = [],
        __width = 5 / 10,
        __curve = -1,
        __headSVG = ``,
        __segmentMaker = -1,
        __tailSVG = ``,
        __styles = ``
    ) {

        // Set name.
        this.name = __name;

        // Set Segments.
        this.segments = [];
        __segments.forEach(_segment => this.Append(_segment));

        // Set width (half width) and curve.
        this.SetWidthAndCurve(__width, __curve);

        // Set Styles.
        this.styles = __styles;

        // Set maker functions.
        this.headSVG = __headSVG;
        // this.segmentMaker;
        this.tailSVG = __tailSVG;
    }


    SetWidthAndCurve(__newWidth, __newCurve) {

        // Check arguments.
        if (!(0 < __newWidth <= 1))
            throw `Snake "${this.name}" got incorrect width "${__newWidth}".`;
        if (__newCurve != -1 && !(0 <= __newCurve <= (1 - __newWidth) / 2))
            throw `New snake "${this.name}" with width of "${__newWidth}" got incorrect curve size "${__curve}"`;

        // Set
        this.width = __newWidth;
        this._halfWidth = __newWidth / 2;
        this.curve = (__newCurve == -1 ? (1 - __newWidth) / 2 : __newCurve);
    }


    Append(point) {
        // if (this.segments.length != 0
        //     && this.segments[0]) return;
        this.segments.push(point);
    }


    Pop() {

    }

    HeadMaker(__centerX, __centerY, __isHorizontal, __isPositive) {
        return $(this.headSVG)
            .attr(`transform`, `
                translate(${__centerX} ${__centerY})
                rotate(${90 * (!__isHorizontal + 2 * __isPositive)} 0 0)
            `);
    }
    SegmentMaker(__centerX, __centerY, __isHorizontal, __isPositive) {
        // return `<a>`
    }
    TailMaker(__centerX, __centerY, __isHorizontal, __isPositive) {
        return $(this.tailSVG)
            .attr(`transform`, `
                translate(${__centerX} ${__centerY})
                rotate(${90 * (!__isHorizontal + 2 * __isPositive)} 0 0)
            `);
    }
    BodyMaker() {
        // Main idea here is to make two paths, parallel around the central "core" path, 
        // and than connect them, forming a snake-width thick figure around "core" path,
        // to achieve this in one cycle,
        // first path is drawn normally,
        // while the second one is reversed.

        var snakeBodySegmentDecors = [],
            snakeHead = ``,
            snakeTail = ``;

        // for a snake going down:
        // Path A is a left side;
        // Path B is a right side.
        var pathA = "",
            pathB = "";

        // Iterate through segments.
        for (let index = 0; index < this.segments.length; index++) {

            // Central point of current segment.
            var _thisSegmentCenterX = this.segments[index][0] + .5,
                _thisSegmentCenterY = this.segments[index][1] + .5;

            // If first segment.
            if (index == 0) {

                // Get Front and/or Back paths.
                var _dxFrontPath = this.segments[index + 1][0] - this.segments[index][0],
                    _dyFrontPath = this.segments[index + 1][1] - this.segments[index][1];

                // Center start
                pathA += `M${_thisSegmentCenterX},${_thisSegmentCenterY}`;

                // Move paths out of center to body width;
                // vertical or horizontal doesn't matter - the second one will be zero.
                pathA += `h${-_dyFrontPath * this._halfWidth
                    }v${_dxFrontPath * this._halfWidth
                    }`;
                pathB = `H${_thisSegmentCenterX + _dyFrontPath * this._halfWidth
                    }V${_thisSegmentCenterY - _dxFrontPath * this._halfWidth
                    }` + pathB;

                // Center end.
                pathB += `H${_thisSegmentCenterX}V${_thisSegmentCenterY}`;

                // Make head SVG
                snakeHead = this.HeadMaker(_thisSegmentCenterX, _thisSegmentCenterY,
                    _dxFrontPath != 0, _dxFrontPath > 0 || _dyFrontPath > 0);
            }

            // If last segment.
            else if (index == this.segments.length - 1) {

                // Get Front and/or Back paths.
                var _dxBackPath = this.segments[index][0] - this.segments[index - 1][0],
                    _dyBackPath = this.segments[index][1] - this.segments[index - 1][1];

                // Move paths from body width into center;
                // vertical or horizontal doesn't matter - the second one will be zero.
                pathA += `H${_thisSegmentCenterX - _dyFrontPath * this._halfWidth
                    }V${_thisSegmentCenterY + _dxFrontPath * this._halfWidth
                    }`;
                pathB = `H${_thisSegmentCenterX + _dyFrontPath * this._halfWidth
                    }V${_thisSegmentCenterY - _dxFrontPath * this._halfWidth
                    }` + pathB;

                // Make tail SVG
                snakeTail = this.TailMaker(_thisSegmentCenterX, _thisSegmentCenterY,
                    _dxFrontPath != 0, _dxFrontPath > 0 || _dyFrontPath > 0);
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

                // Is this corner segment is rotated clockwise.
                var _isClockwise = (_dxFrontPath + _dxBackPath) * (_dyFrontPath - _dyBackPath) > 0;

                // Move paths for this segment;
                // To reduce size of path, it make ether vertical or horizontal move.
                pathA +=
                    // Make a straight move.
                    (_dxBackPath != 0 ? 'H' : 'V') + (
                        (_dxBackPath != 0 ? _thisSegmentCenterX : _thisSegmentCenterY)
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
                        (_dxFrontPath != 0 ? _thisSegmentCenterX : _thisSegmentCenterY)
                        + ((this._halfWidth - this.curve * (_isClockwise ? 1 : -1)) * (_isClockwise == (_dxFrontPath > 0 || _dyFrontPath > 0) ? -1 : 1))
                    )
                    // Make a Bezier curve.
                    + `q${(_dxFrontPath > 0 ? "-" : "") + (_dyBackPath != 0 ? this.curve : 0)
                    }${(_dyFrontPath > 0 ? "-" : ",") + (_dxBackPath != 0 ? this.curve : 0)
                    }${(_dxFrontPath > 0 || _dxBackPath > 0 ? "-" : ",") + this.curve
                    }${(_dyFrontPath > 0 || _dyBackPath > 0 ? "-" : ",") + this.curve
                    }`
                    + pathB;

                // Add a Segment decor
                snakeBodySegmentDecors.push(this.SegmentMaker());
            }
        }

        // Return body and segments
        return [
            // Body path.
            $(`<g/>`)
                .attr(`id`, `snake-${this.name}-svg-body-group`)
                .append($(`<path/>`)
                    .attr(`id`, `snake-${this.name}-svg-body-path`)
                    .attr(`d`, pathA + pathB)
                    .addClass(`snake-body`)
                ).attr(`transform`, `scale(${GRIDSCALE}, ${GRIDSCALE})`),
            // Segment decors.
            $(`<g/>`)
                .attr(`id`, `snake-${this.name}-svg-segment-group`)
                .append(snakeBodySegmentDecors)

                .attr(`transform`, `scale(${GRIDSCALE}, ${GRIDSCALE})`),
            // Head
            $(`<g/>`)
                .attr(`id`, `snake-${this.name}-svg-head-group`)
                .append(snakeHead)

                .attr(`transform`, `scale(${GRIDSCALE}, ${GRIDSCALE})`),
            // Tail
            $(`<g/>`)
                .attr(`id`, `snake-${this.name}-svg-body-group`)
                .append(snakeTail)

                .attr(`transform`, `scale(${GRIDSCALE}, ${GRIDSCALE})`),
        ];
    }
    Update() {
        if (this.segments.length <= 2) throw "snake is to small!";

        var _snakeSVG = $(`<svg></svg>`);
        var _snakeDIV = $(`<div></div>`)
            .attr(`id`, `snake-${this.name}-div`)
            .html("").append(_snakeSVG).appendTo($("#snakes"));

        // Set attributes to svg.
        _snakeSVG
            .attr(`id`, `snake-${this.name}-svg`)
            .attr(`xmlns`, `http://www.w3.org/2000/svg`)
            .attr(`viewBox`, `0 0 ${GRIDCOLS * GRIDSCALE} ${GRIDROWS * GRIDSCALE}`)
            .append(`<defs><style>${this.styles}</style></defs>`);

        // Make snake
        // _snakeSVG.append(this.HeadMaker());
        _snakeSVG.append(this.BodyMaker());
        _snakeSVG.append(this.TailMaker());

        // Add to screen and refresh
        _snakeDIV.html(_snakeDIV.html());
    }
};

const SNAKE_RIPTIDE = [
    5 / 10,
    -1,
    `<g class="snake-head">
        
    <path class="snake-tongue" d="M0,0
        v-.05
        q.3,0,.3,-.05
        q0,.05,-.1,.1
        q.1,.05,.1,.1
        q0,-.05,-.3,-.05
        v-.05
        z
        " transform="scale(1.5 1.5)">
        <animateMotion dur="5s" repeatCount="indefinite" path="M0,0
            h-.3
            h.3
            h-.3
            h.3
            h.3
            h-.3
            " />
    </path>
    <path class="snake-body" d="M0,0
        m.3,0
        q0-.2-.4-.2
        q-.2,0-.2,.2
        q0,.2,.2,.2
        q.4,0,.4,-.2
        z
    " transform="scale(1.5 1.5)">
    </path>
    <g>
        <ellipse class="" cx="0" cy=".25" rx=".20" ry=".15"></ellipse>
        <ellipse class="snake-eye" cx=".04" cy=".25" rx=".12" ry=".09"></ellipse>
    </g>
    <g>
        <ellipse class="" cx="0" cy="-.25" rx=".20" ry=".15"></ellipse>
        <ellipse class="snake-eye" cx=".04" cy="-.25" rx=".12" ry=".09"></ellipse>
    </g>
</g>`,
    -1,
    `<path class="snake-body" d="M0,0
    m0,.25
    q-.1,0,-.4,-.25
    q.3,-.25,.4,-.25
    
    ">
    </path>
`,
    `.snake-body {
        fill: #00f;
        stroke: #000000;
        stroke-width: 0.05;
    }
    .snake-tongue {
        fill: #f00;
        stroke: #000000;
        stroke-width: 0.02;
    }
    .snake-eye {
        fill: #fff;
        stroke: #000000;
        stroke-width: 0.02;
    }`
]
$(() => {
    s = new Snake("rip",
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
        ...SNAKE_RIPTIDE,
    );
    s.Update();
})