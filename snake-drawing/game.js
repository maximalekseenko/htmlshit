const GRIDCOLS = 10;
const GRIDROWS = 10;

const SNAKE_DATA_RIPTIDE = {
    dataName: "riptide",
    bodyWidth: .5,
    styles: `
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
    segmentSVGHead: {
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
    segmentSVGTail: {
        0:
            `<g class="snake-tail">
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
    segmentSVGCenter: {

    },
    segmentSVGDefault:
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
    segmentSVGOverlapPreference: ["head", "tail", "center", "default"],
    minLength: 4
}


/** @type {Snake} */
var snake;
var gameMode = "grow";

function ChangeMode() {
    if (gameMode == "move")
        gameMode = "grow";

    else if (gameMode == "grow")
        gameMode = "move"

    $(`#menuButtonChangeMode`).html(`Mode:${gameMode}`);
}

function GridButtonPressNewSegment(__x, __y) {
    var _isCuttingHead = snake.segments.length != 0 && snake.segments[0][0] == __x && snake.segments[0][1] == __y

    // Change snake
    if (gameMode == "grow") {
        if (_isCuttingHead)
            snake.CutHead();
        else snake.GrowHead([__x, __y]);
    }
    else if (gameMode == "move") {
        if (!_isCuttingHead)
            snake.Move([__x, __y]);
    }

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
    ].filter(_other_point => !snake.IsAtPoint(_other_point))
        .forEach((_other_point) => {
            $(`.grid-tile-${_other_point[0]}-${_other_point[1]}`).prop("disabled", false);
        }
        );
    $(`.grid-tile-${snake.segments[0][0]}-${snake.segments[0][1]}`).prop("disabled", false);
}

$(() => {

    var _grid = $("#grid")
        .css(`grid-template-columns`, `repeat(${GRIDCOLS}, 1fr)`)
        .css(`grid-template-rows`, `repeat(${GRIDROWS}, 1fr)`);


    for (let iRow = 0; iRow < GRIDROWS; iRow++)
        for (let iCol = 0; iCol < GRIDCOLS; iCol++)
            _grid.append(`<button class="grid-tile grid-tile-${iCol}-${iRow}" onclick="GridButtonPressNewSegment(${iCol}, ${iRow})">`);


    // Starting snake shit
    snake = new Snake("riptide", [[5, 3], [5, 2], [4, 2], [4, 3], [4, 4], [5, 4]], {...new SnakeData(), ...SNAKE_DATA_RIPTIDE}, [GRIDCOLS, GRIDROWS]);
    GridButtonPressNewSegment(5, 5);
    ChangeMode();
})