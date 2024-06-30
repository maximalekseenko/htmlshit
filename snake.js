const GRIDROWS = 10;
const GRIDCOLS = 10;


class Snake {
    constructor(
        __name = "rip",
        __segments = [],
        __snakeData = {}
    ) {

        // Set name.
        this.name = __name;

        // Set initial Segments.
        this.segments = [];
        __segments.forEach(_segment => this.GrowHead(_segment));

        // Set data.
        this.SetSnakeData(__snakeData);

    }


    SetSnakeData(__newSnakeData) {

        // Validate new Data.
        if (!(0 < __newSnakeData['bodyWidth'] <= 1))
            throw `Snake "${this.name}" got incorrect width "${__newSnakeData['bodyWidth']}".`;

        this.snakeData = __newSnakeData;

        // Set math-assistant variables.
        this._halfWidth = __newSnakeData['bodyWidth'] / 2;
        this._curve = (1 - __newSnakeData['bodyWidth']) / 2;
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

    __MakeSegmentSvg(
        __segment_index,
        __centerX, __centerY,
        __dxFront, __dyFront,
        __dxBack, __dyBack
    ) {
        // Find correct SVG or SVGs-with-corners.
        var SVG = undefined;
        this.snakeData['segmentSVGs']['overlapPreference'].forEach(segmentType => {
            if (SVG == undefined) {
                if (segmentType == "head")
                    SVG = this.snakeData['segmentSVGs']['head'][__segment_index];
                else if (segmentType == "center")
                    SVG = this.snakeData['segmentSVGs']['center'][this.segments.length / 2 + __segment_index];
                else if (segmentType == "tail")
                    SVG = this.snakeData['segmentSVGs']['tail'][this.segments.length - 1 - __segment_index];
                else if (segmentType == "default")
                    SVG = this.snakeData['segmentSVGs']['default'];
            }
        });

        // If this is SVGs-with-corners,
        // extract the correct one.
        console.log(SVG)
        if (Array.isArray(SVG))
            SVG = SVG[Number(!(__dxBack == __dxFront != 0 || __dyBack == __dyFront != 0))];

        // Compose into html element
        return $(SVG)
            .attr(`transform`,
                `translate(${__centerX} ${__centerY})`
                + `rotate(${90 * ((!__dxFront != 0) + 2 * (__dxFront > 0 || __dyFront > 0))} 0 0)`
                + ((__dxFront + __dxBack) * (__dyFront - __dyBack) > 0 ? `scale(1 -1)` : ``)
            );
    }
    __BodyMaker() {

        // Main idea here is to make two paths, parallel around the central "core" path, 
        // and then connect them, forming a snake-width thick figure around "core" path,
        // to achieve this in one cycle,
        // first path is drawn normally,
        // while the second one is in reversed.

        // for a snake going down:
        // Path A is a left side;
        // Path B is a right side.
        var _pathA = "", _pathB = "";

        var snakeBodySegmentDecors = [];

        // Iterate through segments.
        for (let _segment_index = 0; _segment_index < this.segments.length; _segment_index++) {

            // Central point of current segment.
            var _thisSegmentCenterX = this.segments[_segment_index][0] + .5,
                _thisSegmentCenterY = this.segments[_segment_index][1] + .5;


            // Get directions to this segment and from this segment;
            // if there is no next or previous paths, consider it strait
            var _dxFrontPath, _dyFrontPath, _dxBackPath, _dyBackPath;
            if (_segment_index != this.segments.length - 1) {
                _dxFrontPath = this.segments[_segment_index + 1][0] - this.segments[_segment_index][0];
                _dyFrontPath = this.segments[_segment_index + 1][1] - this.segments[_segment_index][1];
                if (_segment_index == 0) {
                    _dxBackPath = _dxFrontPath;
                    _dyBackPath = _dyFrontPath;
                }
            }
            if (_segment_index != 0) {
                _dxBackPath = this.segments[_segment_index][0] - this.segments[_segment_index - 1][0];
                _dyBackPath = this.segments[_segment_index][1] - this.segments[_segment_index - 1][1];
                if (_segment_index == this.segments.length - 1) {
                    _dxFrontPath = _dxBackPath;
                    _dyFrontPath = _dyBackPath;
                }
            }


            // Add the decoration
            snakeBodySegmentDecors.unshift(this.__MakeSegmentSvg(
                _segment_index,
                _thisSegmentCenterX, _thisSegmentCenterY,
                _dxFrontPath, _dyFrontPath, _dxBackPath, _dyBackPath));

            // If first segment.
            if (_segment_index == 0) {

                // Center start
                _pathA += `M${_thisSegmentCenterX},${_thisSegmentCenterY}`;

                // Move paths out of center to body width;
                // vertical or horizontal doesn't matter - the second one will be zero.
                _pathA += `h${-_dyFrontPath * this._halfWidth
                    }v${_dxFrontPath * this._halfWidth
                    }`;
                _pathB = `H${_thisSegmentCenterX + _dyFrontPath * this._halfWidth
                    }V${_thisSegmentCenterY - _dxFrontPath * this._halfWidth
                    }` + _pathB;

                // Center end.
                _pathB += `H${_thisSegmentCenterX}V${_thisSegmentCenterY}`;
            }

            // If last segment.
            else if (_segment_index == this.segments.length - 1) {

                // Move paths from body width into center;
                // vertical or horizontal doesn't matter - the second one will be zero.
                _pathA += `H${_thisSegmentCenterX - _dyBackPath * this._halfWidth
                    }V${_thisSegmentCenterY + _dxBackPath * this._halfWidth
                    }`;
                _pathB = `H${_thisSegmentCenterX + _dyBackPath * this._halfWidth
                    }V${_thisSegmentCenterY - _dxBackPath * this._halfWidth
                    }` + _pathB;
            }

            // If middle segments.
            else {

                // Skip segment if its is not a corner one.
                if (_dxBackPath == _dxFrontPath != 0 || _dyBackPath == _dyFrontPath != 0)
                    continue;

                // Is this corner segment is rotated clockwise.
                var _isClockwise = (_dxFrontPath + _dxBackPath) * (_dyFrontPath - _dyBackPath) > 0;

                // Move paths for this segment;
                // To reduce size of path, it make ether vertical or horizontal move.
                _pathA +=
                    // Make a straight move.
                    (_dxBackPath != 0 ? 'H' : 'V') + (
                        (_dxBackPath != 0 ? _thisSegmentCenterX : _thisSegmentCenterY)
                        + ((this._halfWidth + this._curve * (_isClockwise ? 1 : -1)) * (_isClockwise == (_dxBackPath > 0 || _dyBackPath > 0) ? -1 : 1))
                    )
                    // Make a Bezier curve.
                    + `q${(_dxBackPath < 0 ? "-" : "") + (_dyFrontPath != 0 ? this._curve : 0)
                    }${(_dyBackPath < 0 ? "-" : ",") + (_dxFrontPath != 0 ? this._curve : 0)
                    }${(_dxBackPath < 0 || _dxFrontPath < 0 ? "-" : ",") + this._curve
                    }${(_dyBackPath < 0 || _dyFrontPath < 0 ? "-" : ",") + this._curve
                    }`;
                _pathB =
                    // Make a straight move.
                    (_dxFrontPath != 0 ? 'H' : 'V') + (
                        (_dxFrontPath != 0 ? _thisSegmentCenterX : _thisSegmentCenterY)
                        + ((this._halfWidth - this._curve * (_isClockwise ? 1 : -1)) * (_isClockwise == (_dxFrontPath > 0 || _dyFrontPath > 0) ? -1 : 1))
                    )
                    // Make a Bezier curve.
                    + `q${(_dxFrontPath > 0 ? "-" : "") + (_dyBackPath != 0 ? this._curve : 0)
                    }${(_dyFrontPath > 0 ? "-" : ",") + (_dxBackPath != 0 ? this._curve : 0)
                    }${(_dxFrontPath > 0 || _dxBackPath > 0 ? "-" : ",") + this._curve
                    }${(_dyFrontPath > 0 || _dyBackPath > 0 ? "-" : ",") + this._curve
                    }`
                    + _pathB;
            }
        }

        // Return svg components:
        return [
            // Body path;
            $(`<g/>`)
                .attr(`id`, `snake-${this.name}-svg-body-group`)
                .append($(`<path/>`)
                    .attr(`id`, `snake-${this.name}-svg-body-path`)
                    .attr(`d`, _pathA + _pathB)
                    .addClass(`snake-body`)
                ),

            // Segment decors;
            $(`<g/>`)
                .attr(`id`, `snake-${this.name}-svg-segment-group`)
                .append(snakeBodySegmentDecors)
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
            .append(`<defs><style>${this.snakeData['styles']}</style></defs>`)
            .append(this.__BodyMaker());


        // Add to screen and refresh:
        // for some fucking reason, if you add an SVG to html,
        // it wont treat it as SVG unless you "refresh" it wtf.
        _snakeDIV
            .html(_snakeSVG)
            .html(_snakeDIV.html());
    }
};

const SNAKE_DATA_RIPTIDE = {
    'dataName': "riptide",
    'bodyWidth': .5,
    'styles': `
        .snake-body {
            fill: #004d86;
            stroke: #000000;
            stroke-width: 30%;
            vector-effect:non-scaling-stroke;
        }
        .snake-tongue {
            fill: #0072c6;
            stroke: #000000;
            stroke-width: 15%;
            vector-effect:non-scaling-stroke;
        }
        .snake-eye {
            fill: #fff;
            stroke: none;
        }
        .snake-spike {
            fill: #849dab;
            stroke: #000000;
            stroke-width: 15%;
            vector-effect:non-scaling-stroke;
        }`,
    'segmentSVGs': {
        'head': {
            0:
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
            1: [
                `<g class="snake-segment">
                    <path class="snake-spike" d="M0,0m.15,0q0-.05,-.1,-.05q-.1,0,-.2,.05q.1,.05,.2,.05q.1,0,.1,-.05z" transform="translate(-.5,0) scale(1.4 1.4) rotate(180)"></path>
                    <path class="snake-spike" d="M0,0m.15,0q0-.05,-.1,-.05q-.1,0,-.2,.05q.1,.05,.2,.05q.1,0,.1,-.05z" transform="translate(-.16,0) scale(0.8 1) rotate(180)"></path>
                    <path class="snake-spike" d="M0,0m.15,0q0-.05,-.1,-.05q-.1,0,-.2,.05q.1,.05,.2,.05q.1,0,.1,-.05z" transform="translate(.16,0) scale(0.8 1) rotate(180)"></path>
                </g>`,
                `<g class="snake-segment">
                    <path class="snake-spike" d="M0,0m.15,0q0-.05,-.1,-.05q-.1,0,-.2,.05q.1,.05,.2,.05q.1,0,.1,-.05z" transform="translate(-.5,0) scale(1.4 1.4) rotate(180)"></path>
                    <path class="snake-spike" d="M0,0m.15,0q0-.05,-.1,-.05q-.1,0,-.2,.05q.1,.05,.2,.05q.1,0,.1,-.05z" transform="translate(-.20,.05) scale(0.8 0.8) rotate(202.5)"></path>
                    <path class="snake-spike" d="M0,0m.15,0q0-.05,-.1,-.05q-.1,0,-.2,.05q.1,.05,.2,.05q.1,0,.1,-.05z" transform="translate(-.05,.20) scale(0.8 0.8) rotate(245.5)"></path>
                </g>`
            ],
        },
        'tail': {
            0: `
                <g class="snake-tail">
                    <path class="snake-body" d="M0,0m.15,.25h-.1q-.3,0,-.6,-.25q.4,-.25,.6,-.25h.1"></path>
                    <path class="snake-spike" d="M0,0m.15,0q0-.05,-.1,-.05q-.1,0,-.2,.05q.1,.05,.2,.05q.1,0,.1,-.05z" transform="translate(-.16,0) scale(0.8 1) rotate(180)"></path>
                    <path class="snake-spike" d="M0,0m.15,0q0-.05,-.1,-.05q-.1,0,-.2,.05q.1,.05,.2,.05q.1,0,.1,-.05z" transform="translate(.16,0) scale(0.8 1) rotate(180)"></path>
                </g>`,
            1: [
                `<g class="snake-segment">
                    <path class="snake-spike" d="M0,0m.15,0q0-.05,-.1,-.05q-.1,0,-.2,.05q.1,.05,.2,.05q.1,0,.1,-.05z" transform="translate(-.5,0) scale(0.8 1) rotate(180)"></path>
                    <path class="snake-spike" d="M0,0m.15,0q0-.05,-.1,-.05q-.1,0,-.2,.05q.1,.05,.2,.05q.1,0,.1,-.05z" transform="translate(-.16,0) scale(0.8 1) rotate(180)"></path>
                    <path class="snake-spike" d="M0,0m.15,0q0-.05,-.1,-.05q-.1,0,-.2,.05q.1,.05,.2,.05q.1,0,.1,-.05z" transform="translate(.16,0) scale(0.8 1) rotate(180)"></path>
                </g>`,
                `<g class="snake-segment">
                    <path class="snake-spike" d="M0,0m.15,0q0-.05,-.1,-.05q-.1,0,-.2,.05q.1,.05,.2,.05q.1,0,.1,-.05z" transform="translate(-.5,0) scale(0.8 1) rotate(180)"></path>
                    <path class="snake-spike" d="M0,0m.15,0q0-.05,-.1,-.05q-.1,0,-.2,.05q.1,.05,.2,.05q.1,0,.1,-.05z" transform="translate(-.20,.05) scale(0.8 0.8) rotate(202.5)"></path>
                    <path class="snake-spike" d="M0,0m.15,0q0-.05,-.1,-.05q-.1,0,-.2,.05q.1,.05,.2,.05q.1,0,.1,-.05z" transform="translate(-.05,.20) scale(0.8 0.8) rotate(245.5)"></path>
                </g>`
            ]
        },
        'center': {

        },
        'default':
            [
                `<g class="snake-segment">
                    <path class="snake-spike" d="M0,0m.15,0q0-.05,-.1,-.05q-.1,0,-.2,.05q.1,.05,.2,.05q.1,0,.1,-.05z" transform="translate(-.5,0) scale(1.4 1.4) rotate(180)"></path>
                    <path class="snake-spike" d="M0,0m.15,0q0-.05,-.1,-.05q-.1,0,-.2,.05q.1,.05,.2,.05q.1,0,.1,-.05z" transform="scale(0.8 0.8) rotate(180)"></path>
                </g>`,
                `<g class="snake-segment">
                    <path class="snake-spike" d="M0,0m.15,0q0-.05,-.1,-.05q-.1,0,-.2,.05q.1,.05,.2,.05q.1,0,.1,-.05z" transform="translate(-.5,0) scale(1.4 1.4) rotate(180)"></path>
                    <path class="snake-spike" d="M0,0m.15,0q0-.05,-.1,-.05q-.1,0,-.2,.05q.1,.05,.2,.05q.1,0,.1,-.05z" transform="translate(-.1,.1) scale(0.8 0.8) rotate(225)"></path>
                </g>`
            ],
        'overlapPreference': ["head", "tail", "center", "default"]
    }
}


const snake = new Snake("rip", [], SNAKE_DATA_RIPTIDE)

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


    // Starting snake shit
    GridButtonPressNewSegment(5, 3);
    GridButtonPressNewSegment(5, 2);
    GridButtonPressNewSegment(4, 2);
    GridButtonPressNewSegment(4, 3);
    GridButtonPressNewSegment(4, 4);
    GridButtonPressNewSegment(5, 4);
    GridButtonPressNewSegment(5, 5);
})