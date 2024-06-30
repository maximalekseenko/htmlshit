/** This file contains class definition for a snake and relative shit
 * @author maxim alekseenko
 */

/**
 * @typedef {string | string[]} SegmentSVG
 */

/** Data, required to create a snake. */
class SnakeData {
    constructor() {

        /** Name of this snakeData.
         * @type {string}
        */
        this.dataName = "";

        /** Creator of this snakeData.
         * @type {string}
        */
        this.dataAuthor = "";

        /** Width of the snake.Must be in range[1, 0).
         * @type {number}
        */
        this.bodyWidth = 0.5;

        /** Styles, used by SVGs in this snake.Snake's body's style is "snake-body".
         * @type {string}
        */
        this.styles = "";

        /** Dictionary of SegmentSVGs, where keys are segment indexes counted from the head(increments down to tail).
         * @type {{[index: number]: SegmentSVG}}
         */
        this.segmentSVGHead = [];

        /** Dictionary of SegmentSVGs, where keys are segment indexes counted from the head(increments down to tail).
         * @type {{[index: number]: SegmentSVG}}
         */
        this.segmentSVGCenter = [];

        /** Dictionary of SegmentSVGs, where keys are segment indexes counted from the head(increments up to head).
        * @type {{[index: number]: SegmentSVG}}
        */
        this.segmentSVGTail = [];

        /** SegmentSVG that is used along the body.
         * @type {SegmentSVG}
         */
        this.segmentSVGDefault = ``;

        /** In case where multiple segmentSVGs may be at one index (due to length for example),
         * this order defines which SVG will be selected in the end, preferring the leftmost one.
         * @type {string[]} 
         */
        this.segmentOverlapPreference = ["head", "center", "tail", "default"];

        /** Minimal length of this snake.
         * Cut functions wont work if minimal length is reached.
         * @type {number}
         */
        this.minLength = 2;
    }
}

/** Snake <3 */
class Snake {
    /** Initializes a new snake.
     * @param {string } __name 
     * @param {number[][] } __segments Array of starting points this snake occupies. Must be valid points.
     * @param {SnakeData } __snakeData Snake data for this snake.
     * @param {number[] } __gridDimensions Dimensions of a grid, this snake is moving on.
     */
    constructor(
        __name,
        __segments,
        __snakeData,
        __gridDimensions
    ) {

        /** Name of this snake. Used as an id.
         * It is unsafe to change it, as it is used as an Id for all html components of this snake.
         * @constant
         * @type {string} 
        */
        this.name = __name;

        /** Array of connected points, forming this snake.
         * @type {number[][] }
         * @private Use Grow and Cut functions to access plz.
         */
        this.segments = [];
        __segments.forEach(_segment => this.GrowHead(_segment));

        /** Data used for this snake.
         * @type {SnakeData }
         * @private use SetSnakeData to change.
         */
        this.snakeData = Object.assign(new SnakeData(), __snakeData);

        /**
         * @type {number[] }
         */
        this.gridDimensions = __gridDimensions;

        // Render on screen.
        this.Update();
    }


    /** Adds a new first segment to this snake.
     * @param {number[]} __point A point to grow to. Must be adjacent to a current head.
     */
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

    /** Removes the first (head) segment from this snake. */
    CutHead() {

        // Validate action.
        if (this.segments.length <= this.snakeData.minLength)
            throw `Cannot cut head of a headless snake.`

        // Commit action.
        this.segments.shift();
    }

    /** Removes the last (tail) segment from this snake. */
    CutTail() {

        // Validate action.
        if (this.segments.length <= this.snakeData.minLength)
            throw `Cannot cut tail of a tailless snake.`

        // Commit action.
        this.segments.pop();
    }

    /** moves the snake to an adjacent point.
     * @param {number[]} __point Point to move on. Must be adjacent to snake's head.
     * @param {boolean} [__doUpdate=false] Should this function run Update upon completion.
     */
    Move(__point, __doUpdate = false) {
        this.GrowHead(__point);
        this.CutTail();

        if (__doUpdate)
            this.Update();
    }

    /** Check if this snake occupies a point.
     * @param {number[]} __point A point on the grid, to check for a snake in it.
     * @returns {boolean}
     */
    IsAtPoint(__point) {
        return this.segments.some(_snake_point => _snake_point[0] == __point[0] && _snake_point[1] == __point[1]);
    }

    /** Creates an SVG components for corresponding segment.
     * @param {number} __segment_index Index of this segment.
     * @param {number} __centerX Center of the cell on the grid on x axis, this segment is located in.
     * @param {number} __centerY Center of the cell on the grid on y axis, this segment is located in.
     * @param {number} __dxFront Delta between this segment to next one on x axis.
     * @param {number} __dyFront Delta between this segment to next one on y axis.
     * @param {number} __dxBack Delta between previous segment to this one on x axis.
     * @param {number} __dyBack Delta between previous segment to this one on y axis.
     * @returns {SegmentSVG} SVG component of a snake's segment, moved and rotated correspondingly.
     * @private
     */
    MakeSegmentSvg(
        __segment_index,
        __centerX, __centerY,
        __dxFront, __dyFront,
        __dxBack, __dyBack
    ) {

        // Find correct SVG or SVGs-with-corners.
        /** @type {SegmentSVG} */
        var SVG = undefined;
        this.snakeData.segmentOverlapPreference.forEach(segmentType => {
            if (SVG == undefined) {
                if (segmentType == "head")
                    SVG = this.snakeData.segmentSVGHead[__segment_index];
                else if (segmentType == "center")
                    SVG = this.snakeData.segmentSVGCenter[this.segments.length / 2 + __segment_index];
                else if (segmentType == "tail")
                    SVG = this.snakeData.segmentSVGTail[this.segments.length - 1 - __segment_index];
                else if (segmentType == "default")
                    SVG = this.snakeData.segmentSVGDefault;
            }
        });

        // If this is SVGs-with-corners,
        // extract the correct one.
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

    /** Creates SVG components of this snake.
     * @returns {SegmentSVG[]} Array of SVG components, defining this snake's look.
     * @private 
     */
    BodyMaker() {

        // Main idea here is to make two paths, parallel around the central "core" path, 
        // and then connect them, forming a snake-width thick figure around "core" path,
        // to achieve this in one cycle,
        // first path is drawn normally,
        // while the second one is in reversed.

        // for a snake going down:
        // Path A is a left side;
        // Path B is a right side.
        var _pathA = "", _pathB = "";

        // Calculate common math shit.
        var _halfWidth = this.snakeData.bodyWidth / 2,
            _curve = (1 - this.snakeData.bodyWidth) / 2;

        var snakeBodySegmentDecors = [];

        // Iterate through segments.
        for (let _segment_index = 0; _segment_index < this.segments.length; _segment_index++) {

            // Central point of current segment.
            var _centerX = this.segments[_segment_index][0] + .5,
                _centerY = this.segments[_segment_index][1] + .5;


            // Get directions to this segment and from this segment;
            // if there is no next or previous paths, consider it strait
            var _dxFront, _dyFront, _dxBack, _dyBack;
            if (_segment_index != this.segments.length - 1) {
                _dxFront = this.segments[_segment_index + 1][0] - this.segments[_segment_index][0];
                _dyFront = this.segments[_segment_index + 1][1] - this.segments[_segment_index][1];
                if (_segment_index == 0) {
                    _dxBack = _dxFront;
                    _dyBack = _dyFront;
                }
            }
            if (_segment_index != 0) {
                _dxBack = this.segments[_segment_index][0] - this.segments[_segment_index - 1][0];
                _dyBack = this.segments[_segment_index][1] - this.segments[_segment_index - 1][1];
                if (_segment_index == this.segments.length - 1) {
                    _dxFront = _dxBack;
                    _dyFront = _dyBack;
                }
            }

            // Add the decoration
            snakeBodySegmentDecors.unshift(this.MakeSegmentSvg(
                _segment_index,
                _centerX, _centerY,
                _dxFront, _dyFront, _dxBack, _dyBack));

            // If first segment.
            if (_segment_index == 0) {

                // Center start
                _pathA += `M${_centerX},${_centerY}`;

                // Move paths out of center to body width;
                // vertical or horizontal doesn't matter - the second one will be zero.
                _pathA += `h${-_dyFront * _halfWidth
                    }v${_dxFront * _halfWidth
                    }`;
                _pathB = `H${_centerX + _dyFront * _halfWidth
                    }V${_centerY - _dxFront * _halfWidth
                    }` + _pathB;

                // Center end.
                _pathB += `H${_centerX}V${_centerY}`;
            }

            // If last segment.
            else if (_segment_index == this.segments.length - 1) {

                // Move paths from body width into center;
                // vertical or horizontal doesn't matter - the second one will be zero.
                _pathA += `H${_centerX - _dyBack * _halfWidth
                    }V${_centerY + _dxBack * _halfWidth
                    }`;
                _pathB = `H${_centerX + _dyBack * _halfWidth
                    }V${_centerY - _dxBack * _halfWidth
                    }` + _pathB;
            }

            // If middle segments.
            else {

                // Skip segment if its is not a corner one.
                if (_dxBack == _dxFront != 0 || _dyBack == _dyFront != 0)
                    continue;

                // Is this corner segment is rotated clockwise.
                var _isClockwise = (_dxFront + _dxBack) * (_dyFront - _dyBack) > 0;

                // Move paths for this segment;
                // To reduce size of path, it make ether vertical or horizontal move.
                _pathA +=
                    // Make a straight move.
                    (_dxBack != 0 ? 'H' : 'V') + (
                        (_dxBack != 0 ? _centerX : _centerY)
                        + ((_halfWidth + _curve * (_isClockwise ? 1 : -1)) * (_isClockwise == (_dxBack > 0 || _dyBack > 0) ? -1 : 1))
                    )
                    // Make a Bezier curve.
                    + `q${(_dxBack < 0 ? "-" : "") + (_dyFront != 0 ? _curve : 0)
                    }${(_dyBack < 0 ? "-" : ",") + (_dxFront != 0 ? _curve : 0)
                    }${(_dxBack < 0 || _dxFront < 0 ? "-" : ",") + _curve
                    }${(_dyBack < 0 || _dyFront < 0 ? "-" : ",") + _curve
                    }`;
                _pathB =
                    // Make a straight move.
                    (_dxFront != 0 ? 'H' : 'V') + (
                        (_dxFront != 0 ? _centerX : _centerY)
                        + ((_halfWidth - _curve * (_isClockwise ? 1 : -1)) * (_isClockwise == (_dxFront > 0 || _dyFront > 0) ? -1 : 1))
                    )
                    // Make a Bezier curve.
                    + `q${(_dxFront > 0 ? "-" : "") + (_dyBack != 0 ? _curve : 0)
                    }${(_dyFront > 0 ? "-" : ",") + (_dxBack != 0 ? _curve : 0)
                    }${(_dxFront > 0 || _dxBack > 0 ? "-" : ",") + _curve
                    }${(_dyFront > 0 || _dyBack > 0 ? "-" : ",") + _curve
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

            // Segments;
            $(`<g/>`)
                .attr(`id`, `snake-${this.name}-svg-segment-group`)
                .append(snakeBodySegmentDecors)
        ];
    }

    /** Updates the snake, accounting for any changes.
     */
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
            .attr(`viewBox`, `0 0 ${this.gridDimensions[0]} ${this.gridDimensions[1]}`)
            .append(`<defs><style>${this.snakeData['styles']}</style></defs>`)
            .append(this.BodyMaker());


        // Add to screen and refresh:
        // for some fucking reason, if you add an SVG to html,
        // it wont treat it as SVG unless you "refresh" it wtf.
        _snakeDIV
            .html(_snakeSVG)
            .html(_snakeDIV.html());
    }
};