const GRIDROWS = 10;
const GRIDCOLS = 10;


class Snake {
    constructor(
        __name = "rip",
        __segments = [],
        __width = 5 / 10,
        __curve = -1,
        __headSVG = ``,
        __segmentSVGs = [``, ``],
        __tailSVG = ``,
        __styles = ``,
        __snakeData = {}
    ) {

        // Set name.
        this.name = __name;

        // Set Segments.
        this.segments = [];
        __segments.forEach(_segment => this.GrowHead(_segment));

        // Set width (half width) and curve.
        this.SetWidthAndCurve(__width, __curve);

        // Set Styles.
        this.styles = __styles;

        // Set maker functions.
        this.headSVG = __headSVG;
        this.segmentSVGs = __segmentSVGs;
        this.tailSVG = __tailSVG;


        this.snakeData = __snakeData;
    }


    SetWidthAndCurve(__newWidth, __newCurve) {

        // Check arguments.
        if (!(0 < __newWidth <= 1))
            throw `Snake "${this.name}" got incorrect width "${__newWidth}".`;
        if (__newCurve != -1 && !(0 <= __newCurve <= (1 - __newWidth) / 2))
            throw `New snake "${this.name}" with width of "${__newWidth}" got incorrect curve size "${__curve}".`;

        // Set
        this.width = __newWidth;
        this._halfWidth = __newWidth / 2;
        this.curve = (__newCurve == -1 ? (1 - __newWidth) / 2 : __newCurve);
    }


    GrowHead(__point) {

        // Validate action.
        if (this.segments.some(_segment => _segment[0] == __point[0] && _segment[1] == __point[1]))
            throw `Snake "${this.name}" attempted to grow into itself at "${__point}".`
        if (this.segments.length != 0 && (
            1 != ((__point[0] - this.segments[0][0]) * (__point[0] - this.segments[0][0])
                + (__point[1] - this.segments[0][1]) * (__point[1] - this.segments[0][1]))
        ))
            throw `Snake "${this.name}" attempted to grow head in tile "${__point}" that is not adjacent to it's head at "${this.segments[0]}".`

        // Commit action.
        this.segments.unshift(__point);
    }

    CutHead() {

        // Validate action.
        if (this.segments.length == 0)
            throw `Cannot cut head of a headless snake.`

        // Commit action.
        this.segments.shift();
    }

    CutTail() {

        // Validate action.
        if (this.segments.length == 0)
            throw `Cannot cut tail of a tailless snake.`

        // Commit action.
        this.segments.pop();
    }

    Move(__point) {
        this.GrowHead(__point);
        this.CutTail();
    }

    __GetAngle(__dx, __dy) { return 90 * ((!__dx != 0) + 2 * (__dx > 0 || __dy > 0)); }

    __HeadMaker(__centerX, __centerY, __dxFront, __dyFront) {
        return $(this.headSVG)
            .attr(`transform`,
                `translate(${__centerX} ${__centerY})`
                + `rotate(${this.__GetAngle(__dxFront, __dyFront)} 0 0)`
            );
    }
    __SegmentMaker(__centerX, __centerY, __dxFront, __dyFront, __dxBack, __dyBack) {
        return $(this.segmentSVGs[Number(!(__dxBack == __dxFront != 0 || __dyBack == __dyFront != 0))])
            .attr(`transform`,
                `translate(${__centerX} ${__centerY})`
                + `rotate(${this.__GetAngle(__dxFront, __dyFront)} 0 0)`
                + ((__dxFront + __dxBack) * (__dyFront - __dyBack) > 0 ? `scale(1 -1)` : ``)
            );
    }
    __TailMaker(__centerX, __centerY, __dxBack, __dyBack) {
        return $(this.tailSVG)
            .attr(`transform`,
                `translate(${__centerX} ${__centerY})`
                + `rotate(${this.__GetAngle(__dxBack, __dyBack)} 0 0)`
            );
    }
    __BodyMaker() {

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
                snakeHead = this.__HeadMaker(_thisSegmentCenterX, _thisSegmentCenterY, _dxFrontPath, _dyFrontPath);
            }

            // If last segment.
            else if (index == this.segments.length - 1) {

                // Get Front and/or Back paths.
                var _dxBackPath = this.segments[index][0] - this.segments[index - 1][0],
                    _dyBackPath = this.segments[index][1] - this.segments[index - 1][1];

                // Move paths from body width into center;
                // vertical or horizontal doesn't matter - the second one will be zero.
                pathA += `H${_thisSegmentCenterX - _dyBackPath * this._halfWidth
                    }V${_thisSegmentCenterY + _dxBackPath * this._halfWidth
                    }`;
                pathB = `H${_thisSegmentCenterX + _dyBackPath * this._halfWidth
                    }V${_thisSegmentCenterY - _dxBackPath * this._halfWidth
                    }` + pathB;

                // Make tail SVG
                snakeTail = this.__TailMaker(_thisSegmentCenterX, _thisSegmentCenterY, _dxBackPath, _dyBackPath);
            }

            // If middle segments.
            else {

                // Get Front and/or Back paths.
                var _dxFrontPath = this.segments[index + 1][0] - this.segments[index][0],
                    _dyFrontPath = this.segments[index + 1][1] - this.segments[index][1];
                var _dxBackPath = this.segments[index][0] - this.segments[index - 1][0],
                    _dyBackPath = this.segments[index][1] - this.segments[index - 1][1];

                // Add a Segment decor
                snakeBodySegmentDecors.push(this.__SegmentMaker(
                    _thisSegmentCenterX, _thisSegmentCenterY,
                    _dxFrontPath, _dyFrontPath,
                    _dxBackPath, _dyBackPath
                ));

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
            }
        }

        // Return svg components:
        return [
            // Body path;
            $(`<g/>`)
                .attr(`id`, `snake-${this.name}-svg-body-group`)
                .append($(`<path/>`)
                    .attr(`id`, `snake-${this.name}-svg-body-path`)
                    .attr(`d`, pathA + pathB)
                    .addClass(`snake-body`)
                ),

            // Segment decors;
            $(`<g/>`)
                .attr(`id`, `snake-${this.name}-svg-segment-group`)
                .append(snakeBodySegmentDecors),

            // Head;
            $(`<g/>`)
                .attr(`id`, `snake-${this.name}-svg-head-group`)
                .append(snakeHead),

            // Tail.
            $(`<g/>`)
                .attr(`id`, `snake-${this.name}-svg-body-group`)
                .append(snakeTail),
        ];
    }
    Update() {

        // Find or create snake container;
        // it is used fro faster updates (see bellow).
        var _snakeDIV = $(`#snake-${this.name}-div`);
        if (!_snakeDIV.length) _snakeDIV = $(`<div></div>`)
            .attr(`id`, `snake-${this.name}-div`)
            .addClass("snake")
            .appendTo($("#snakes"));

        // Make a new SVG of a snake.
        var _snakeSVG = $(`<svg></svg>`)
            .attr(`id`, `snake-${this.name}-svg`)
            .attr(`xmlns`, `http://www.w3.org/2000/svg`)
            .attr(`viewBox`, `0 0 ${GRIDCOLS} ${GRIDROWS}`)
            .append(`<defs><style>${this.styles}</style></defs>`)
            .append(this.__BodyMaker());


        // Add to screen and refresh:
        // for some fucking reason, if you add an SVG to html,
        // it wont treat it as SVG unless you "refresh" it wtf.
        _snakeDIV
            .html(_snakeSVG)
            .html(_snakeDIV.html());
    }
};

const SNAKE_RIPTIDE = [
    5 / 10,
    -1,
    `<g class="snake-head">
        
    <path class="snake-tongue" d="M0,0v-.05q.3,0,.3,-.05q0,.05,-.1,.1q.1,.05,.1,.1q0,-.05,-.3,-.05v-.05z" transform="scale(1.5 1.5)">
        <animateMotion dur="5s" repeatCount="indefinite" path="M0,0h-.3h.3h-.3h.3h.3h-.3" />
    </path>
    <path class="snake-body" d="M0,0m.3,0q0-.2-.4-.2q-.2,0-.2,.2q0,.2,.2,.2q.4,0,.4,-.2z" transform="scale(1.5 1.5)"></path>
    <g>
        <ellipse class="" cx="0" cy=".25" rx=".20" ry=".15"></ellipse>
        <ellipse class="snake-eye" cx=".04" cy=".25" rx=".12" ry=".09"></ellipse>
    </g>
    <g>
        <ellipse class="" cx="0" cy="-.25" rx=".20" ry=".15"></ellipse>
        <ellipse class="snake-eye" cx=".04" cy="-.25" rx=".12" ry=".09"></ellipse>
    </g>
        <path class="snake-spike" d="M0,0m.15,0q0-.05,-.1,-.05q-.1,0,-.2,.05q.1,.05,.2,.05q.1,0,.1,-.05z" transform="translate(-.5,0) scale(1.4 1.4) rotate(180)"></path>
    </g>`,
    [
        `<g class="snake-segment">
            <path class="snake-spike" d="M0,0m.15,0q0-.05,-.1,-.05q-.1,0,-.2,.05q.1,.05,.2,.05q.1,0,.1,-.05z" transform="scale(1.4 1.4) rotate(180)"></path>
            <path class="snake-spike" d="M0,0m.15,0q0-.05,-.1,-.05q-.1,0,-.2,.05q.1,.05,.2,.05q.1,0,.1,-.05z" transform="translate(-.5,0) rotate(180)"></path>
        </g>`,
        `<g class="snake-segment">
            <path class="snake-spike" d="M0,0m.15,0q0-.05,-.1,-.05q-.1,0,-.2,.05q.1,.05,.2,.05q.1,0,.1,-.05z" transform="translate(-.1,.1) scale(1.4 1.4) rotate(225)"></path>
            <path class="snake-spike" d="M0,0m.15,0q0-.05,-.1,-.05q-.1,0,-.2,.05q.1,.05,.2,.05q.1,0,.1,-.05z" transform="translate(-.5,0) rotate(180)"></path>
        </g>`
    ]
    ,
    `<g class="snake-tail">
        <path class="snake-body" d="M0,0m.1,.25h-.1q-.3,0,-.6,-.25q.4,-.25,.6,-.25h.1"></path>
        <path class="snake-spike" d="M0,0m.15,0q0-.05,-.1,-.05q-.1,0,-.2,.05q.1,.05,.2,.05q.1,0,.1,-.05z" transform="translate(.15,0) scale(.9 .9) rotate(180)"></path>
        <path class="snake-spike" d="M0,0m.15,0q0-.05,-.1,-.05q-.1,0,-.2,.05q.1,.05,.2,.05q.1,0,.1,-.05z" transform="translate(-.15,0) scale(.8 .8) rotate(180)"></path>
    </g>`,
    `.snake-body {
        fill: #004d86;
        stroke: #000000;
        stroke-width: 0.05;
    }
    .snake-tongue {
        fill: #0072c6;
        stroke: #000000;
        stroke-width: 0.02;
    }
    .snake-eye {
        fill: #fff;
        stroke: #000000;
        stroke-width: 0.02;
    }
    .snake-spike {
        fill: #849dab;
        stroke: #000000;
        stroke-width: 0.02;
    }`
]

const SNAKE_DATA_RIPTIDE = {
    "dataName": "riptide",
    "bodyWidth": .5,
    "style": `
        .snake-body {
            fill: #004d86;
            stroke: #000000;
            stroke-width: 0.05;
        }
        .snake-tongue {
            fill: #0072c6;
            stroke: #000000;
            stroke-width: 0.02;
        }
        .snake-eye {
            fill: #fff;
            stroke: #000000;
            stroke-width: 0.02;
        }
        .snake-spike {
            fill: #849dab;
            stroke: #000000;
            stroke-width: 0.02;
        }`,
    "segmentSVGs": {
        "head": {
            0: `
                <g class="snake-head">
                    <path class="snake-tongue" d="M0,0v-.05q.3,0,.3,-.05q0,.05,-.1,.1q.1,.05,.1,.1q0,-.05,-.3,-.05v-.05z" transform="scale(1.5 1.5)">
                        <animateMotion dur="5s" repeatCount="indefinite" path="M0,0h-.3h.3h-.3h.3h.3h-.3" />
                    </path>
                    <path class="snake-body" d="M0,0m.3,0q0-.2-.4-.2q-.2,0-.2,.2q0,.2,.2,.2q.4,0,.4,-.2z" transform="scale(1.5 1.5)"></path>
                    <g>
                        <ellipse class="" cx="0" cy=".25" rx=".20" ry=".15"></ellipse>
                        <ellipse class="snake-eye" cx=".04" cy=".25" rx=".12" ry=".09"></ellipse>
                    </g>
                    <g>
                        <ellipse class="" cx="0" cy="-.25" rx=".20" ry=".15"></ellipse>
                        <ellipse class="snake-eye" cx=".04" cy="-.25" rx=".12" ry=".09"></ellipse>
                    </g>
                    <path class="snake-spike" d="M0,0m.15,0q0-.05,-.1,-.05q-.1,0,-.2,.05q.1,.05,.2,.05q.1,0,.1,-.05z" transform="translate(-.5,0) scale(1.4 1.4) rotate(180)"></path>
                </g>`
        },
        "tail": {
            0: `
                <g class="snake-tail">
                    <path class="snake-body" d="M0,0m.1,.25h-.1q-.3,0,-.6,-.25q.4,-.25,.6,-.25h.1"></path>
                    <path class="snake-spike" d="M0,0m.15,0q0-.05,-.1,-.05q-.1,0,-.2,.05q.1,.05,.2,.05q.1,0,.1,-.05z" transform="translate(.15,0) scale(.9 .9) rotate(180)"></path>
                    <path class="snake-spike" d="M0,0m.15,0q0-.05,-.1,-.05q-.1,0,-.2,.05q.1,.05,.2,.05q.1,0,.1,-.05z" transform="translate(-.15,0) scale(.8 .8) rotate(180)"></path>
                </g>`
        },
        "center": {

        },
        "default": [
            `<g class="snake-segment">
                <path class="snake-spike" d="M0,0m.15,0q0-.05,-.1,-.05q-.1,0,-.2,.05q.1,.05,.2,.05q.1,0,.1,-.05z" transform="scale(1.4 1.4) rotate(180)"></path>
                <path class="snake-spike" d="M0,0m.15,0q0-.05,-.1,-.05q-.1,0,-.2,.05q.1,.05,.2,.05q.1,0,.1,-.05z" transform="translate(-.5,0) rotate(180)"></path>
            </g>`,
            `<g class="snake-segment">
                <path class="snake-spike" d="M0,0m.15,0q0-.05,-.1,-.05q-.1,0,-.2,.05q.1,.05,.2,.05q.1,0,.1,-.05z" transform="translate(-.1,.1) scale(1.4 1.4) rotate(225)"></path>
                <path class="snake-spike" d="M0,0m.15,0q0-.05,-.1,-.05q-.1,0,-.2,.05q.1,.05,.2,.05q.1,0,.1,-.05z" transform="translate(-.5,0) rotate(180)"></path>
            </g>`
        ],
        "overlapPreference": ["head", "tail", "center"]
    }
}


const snake = new Snake("rip", [], ...SNAKE_RIPTIDE)

function GridButtonPressNewSegment(__x, __y) {
    var _isCuttingHead = snake.segments.length != 0 && snake.segments[0][0] == __x && snake.segments[0][1] == __y

    // Change snake
    if (_isCuttingHead)
        snake.CutHead();
    else snake.GrowHead([__x, __y]);

    try { snake.Update(); } catch { }

    // Update buttons
    if (_isCuttingHead && snake.segments.length == 0)
        $(`.grid-tile`).prop("disabled", false);

    else $(".grid-tile:enabled").prop("disabled", true);
    [
        [snake.segments[0][0] + 1, snake.segments[0][1]],
        [snake.segments[0][0] - 1, snake.segments[0][1]],
        [snake.segments[0][0], snake.segments[0][1] + 1],
        [snake.segments[0][0], snake.segments[0][1] - 1]
    ].filter(_other_point => !snake.segments.some(_snake_point => _snake_point[0] == _other_point[0] && _snake_point[1] == _other_point[1]))
        .forEach((_other_point) => {
            $(`.grid-tile-${_other_point[0]}-${_other_point[1]}`).prop("disabled", false);
        }
        );
    $(`.grid-tile-${snake.segments[0][0]}-${snake.segments[0][1]}`).prop("disabled", false);
}

$(() => {

    // setup grid
    var _grid = $("#grid")
        .css(`grid-template-columns`, `repeat(${GRIDCOLS}, 1fr)`)
        .css(`grid-template-rows`, `repeat(${GRIDROWS}, 1fr)`);


    for (let iRow = 0; iRow < GRIDROWS; iRow++)
        for (let iCol = 0; iCol < GRIDCOLS; iCol++)
            _grid.append(`<button class="grid-tile grid-tile-${iCol}-${iRow}" onclick="GridButtonPressNewSegment(${iCol}, ${iRow})">`);
})