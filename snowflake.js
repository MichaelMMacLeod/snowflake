"use strict";
// Coordinate system(s):
//
// 1: "World" space. This is two dimensional (x,y) with the origin,
// (0,0), in the center. X values increase towards positive infinity
// to the right and decrease to negative infinity to the left. Y
// values increase towards positive infinity going up and decrease to
// negative infinity going down. Radians refer to the angle that lines
// make with the line starting at (0,0) and extending directly right
// towards positive 'X', counterclockwise. So, for example, a vector
// emerging from the origin and going straight up (towards positive Y)
// would be at pi/2 radians. The part of the world that is visible on
// screen is a 2x2 square centered at the origin.
//
// 2: "Screen" space. This is two dimensional (x,y) with the origin,
// (0,0), in the top left corner. X values increase towards positive
// infinity to the right and decrease to negative infinity to the
// left. Y values increase going *down* towards positive infinity and
// decrease towards negative infinity going *up*.
//
// World space is used for doing all the logical calculations
// necessary to grow the snowflake. All coordinates stored in objects
// are in world space. Screen space is used to draw the snowflake on
// the screen and these coordinates are never saved anywhere.
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
function makeGraphic() {
    var canvas = document.getElementById('snowflake');
    var ctx = canvas.getContext('2d');
    if (ctx === null) {
        return undefined;
    }
    var lightBlue = 'rgba(90, 211, 255, 1.0)';
    ctx.fillStyle = lightBlue;
    return { canvas: canvas, ctx: ctx };
}
function makeGraph() {
    var canvas = document.getElementById('graph');
    var ctx = canvas.getContext('2d');
    if (ctx === null) {
        return undefined;
    }
    var graphMouse = undefined;
    var background = "rgba(203, 203, 255, 1)";
    var result = {
        canvas: canvas,
        ctx: ctx,
        handleBeingDragged: undefined,
        mouseRecentlyExitedGraph: false,
        graphMouse: graphMouse,
        background: background,
    };
    canvas.addEventListener('mousemove', function (e) {
        result.graphMouse = { x: e.offsetX, y: e.offsetY };
    });
    canvas.addEventListener('mousedown', function (e) {
        result.handleBeingDragged = 'needs lookup';
    });
    document.addEventListener('mouseup', function (e) {
        result.handleBeingDragged = undefined;
        result.graphMouse = undefined;
    });
    canvas.addEventListener('mouseleave', function (e) {
        result.mouseRecentlyExitedGraph = true;
    });
    return result;
}
;
function makeControls(graphic) {
    var pause = document.getElementById('pause');
    var reset = document.getElementById('reset');
    return { pause: pause, reset: reset, playing: true };
}
function registerControlsEventListeners(state) {
    var controls = state.controls, graphic = state.graphic;
    var pause = controls.pause, reset = controls.reset;
    pause.addEventListener('click', function (e) {
        controls.playing = !controls.playing;
        if (controls.playing) {
            pause.innerHTML = 'pause';
            graphic.canvas.className = '';
        }
        else {
            pause.innerHTML = 'play';
            graphic.canvas.className = 'paused';
        }
    });
    reset.addEventListener('click', function (e) {
        resetSnowflake(state);
    });
}
var oneSixthCircle = Math.PI * 2 / 6;
var directions = [
    0 * oneSixthCircle,
    1 * oneSixthCircle,
    2 * oneSixthCircle,
    3 * oneSixthCircle,
    4 * oneSixthCircle,
    5 * oneSixthCircle,
];
function isDirection(i) {
    return i === 0 || i === 1 || i === 2 ||
        i === 3 || i === 4 || i === 5;
}
function nextDirection(d) {
    return ((d + 1) % directions.length);
}
function previousDirection(d) {
    return rem(d - 1, directions.length);
}
function copyPoint(p) {
    return { x: p.x, y: p.y };
}
function addPoints(p1, p2) {
    return { x: p1.x + p2.x, y: p1.y + p2.y };
}
var defaultPoint = { x: 0, y: 0 };
var defaultFace = {
    center: defaultPoint,
    size: 0.0025,
    direction: 'none',
    growthScale: 1,
    id: 0,
};
var defaultBranch = {
    rayHits: 0,
    start: defaultPoint,
    size: 0.0025,
    length: 0.005,
    direction: 0,
    growthScale: 1,
    id: 0,
};
function branchEnd(branch) {
    var d = directions[branch.direction];
    var l = branch.length;
    var x = branch.start.x + l * Math.cos(d);
    var y = branch.start.y + l * Math.sin(d);
    return { x: x, y: y };
}
function drawSnowflake(graphic, snowflake) {
    snowflake.faces.growing.forEach(function (f) {
        drawFace(graphic, f);
        // getNormalizedFaceSides(f).forEach((s, i) => {
        //   drawSide(graphic, s, i, f);
        // });
    });
    snowflake.faces.grown.forEach(function (f) { return drawFace(graphic, f); });
    snowflake.branches.growing.forEach(function (b) {
        drawBranch(graphic, b);
        // getNormalizedBranchSides(b).forEach((s, i) => {
        //   drawSide(graphic, s, i, defaultFace);
        // });
    });
    snowflake.branches.grown.forEach(function (b) { return drawBranch(graphic, b); });
}
function worldToViewTransform(graphic, p) {
    var w = graphic.canvas.width;
    var h = graphic.canvas.height;
    // affine transform:
    // |r.x|   |w/2   0   w/2|   |p.x|
    // |r.y| = |0   -h/2  h/2| * |p.y|
    // | 1 |   |0     0    1 |   | 1 |
    var r = {
        x: p.x * w * 0.5 + w * 0.5,
        y: p.y * -h * 0.5 + h * 0.5,
    };
    return r;
}
function drawSide(graphic, side, index, face) {
    // if (index !== 4) {
    //   return;
    // }
    graphic.ctx.beginPath();
    //  const h = 1/6 * (index + 1);
    var h = side.height;
    var left = worldToViewTransform(graphic, { x: side.left, y: h });
    var right = worldToViewTransform(graphic, { x: side.right, y: h });
    graphic.ctx.moveTo(left.x, left.y);
    graphic.ctx.lineTo(right.x, right.y);
    var oldWidth = graphic.ctx.lineWidth;
    graphic.ctx.lineWidth = 10;
    graphic.ctx.strokeStyle = "rgba(".concat(255 / 6 * (index + 1), ", 0, 255, 0.2)");
    graphic.ctx.stroke();
    graphic.ctx.lineWidth = oldWidth;
}
function drawNormalization(graphic, side2d, absoluteDirection) {
    if (absoluteDirection !== 0)
        return;
    var oldWidth = graphic.ctx.lineWidth;
    var oldStyle = graphic.ctx.strokeStyle;
    // // draw the side2d
    // {
    //   const left = worldToViewTransform(graphic, side2d.left);
    //   const right = worldToViewTransform(graphic, side2d.right);
    //   graphic.ctx.beginPath();
    //   graphic.ctx.moveTo(left.x, left.y);
    //   graphic.ctx.lineTo(right.x, right.y);
    //   graphic.ctx.lineWidth = 10;
    //   graphic.ctx.strokeStyle = `rgba(0, 0, 255, 0.2)`;
    //   graphic.ctx.stroke();
    // }
    // draw the side
    var side = normalizeSide2D(side2d, absoluteDirection);
    var left = worldToViewTransform(graphic, { x: side.left, y: side.height });
    var right = worldToViewTransform(graphic, { x: side.right, y: side.height });
    graphic.ctx.beginPath();
    graphic.ctx.moveTo(left.x, left.y);
    graphic.ctx.lineTo(right.x, right.y);
    graphic.ctx.lineWidth = 10;
    graphic.ctx.strokeStyle = "rgba(203, 203, 255, 1)";
    graphic.ctx.stroke();
    // draw the line
    var middle2d = worldToViewTransform(graphic, {
        x: 0.5 * (side2d.left.x + side2d.right.x),
        y: 0.5 * (side2d.left.y + side2d.right.y),
    });
    var middle = worldToViewTransform(graphic, {
        x: 0.5 * (side.left + side.right),
        y: side.height,
    });
    graphic.ctx.beginPath();
    graphic.ctx.moveTo(middle2d.x, middle2d.y);
    graphic.ctx.lineTo(middle.x, middle.y);
    graphic.ctx.lineWidth = 1;
    graphic.ctx.strokeStyle = 'rgba(0, 0, 0, 1)';
    graphic.ctx.stroke();
    // cleanup
    graphic.ctx.lineWidth = oldWidth;
    graphic.ctx.strokeStyle = oldStyle;
}
function drawFace(graphic, face) {
    var dir = face.direction === "none" ? 0 : face.direction;
    // getFaceSide2Ds(face).forEach((side2d, i) => {
    //   drawNormalization(graphic, side2d, (i + dir) % directions.length);
    // });
    //   getNormalizedFaceSides(face).forEach((side, i) => {
    //     const dir = face.direction === "none" ? 0 : face.direction;
    // //    if ((i + dir) % directions.length === 0) {
    //     drawSide(graphic, side, (i + dir) % directions.length, face);
    //   });
    graphic.ctx.beginPath();
    getFacePoints(face).forEach(function (p, i) {
        var _a = worldToViewTransform(graphic, p), x = _a.x, y = _a.y;
        if (i === 0) {
            graphic.ctx.moveTo(x, y);
        }
        else {
            graphic.ctx.lineTo(x, y);
        }
    });
    graphic.ctx.closePath();
    graphic.ctx.fillStyle = "rgba(203, 203, 255, 1)";
    graphic.ctx.fill();
}
function rem(x, m) {
    return ((x % m) + m) % m;
}
function drawBranch(graphic, branch) {
    graphic.ctx.beginPath();
    getBranchPoints(branch).forEach(function (p, i) {
        var _a = worldToViewTransform(graphic, p), x = _a.x, y = _a.y;
        if (i === 0) {
            graphic.ctx.moveTo(x, y);
        }
        else {
            graphic.ctx.lineTo(x, y);
        }
    });
    graphic.ctx.closePath();
    graphic.ctx.fill();
}
// function toCanvasPoint(p: Point): Point {
//   const result = { x: p.x, y: p.y };
//   result.x *= graphic.canvas.width / 2;
//   result.y *= -graphic.canvas.height / 2;
//   result.x += graphic.canvas.width * 0.5;
//   result.y += graphic.canvas.height * 0.5;
//   return result;
// }
function createInitialSnowflake() {
    return {
        faces: {
            growing: [{
                    center: { x: 0, y: 0 },
                    size: 0.0025,
                    direction: 'none',
                    growthScale: 1,
                    id: 0,
                }],
            grown: [],
            waiting: [],
        },
        branches: { growing: [], grown: [], waiting: [] },
    };
}
var growthScalar = 0.001;
var branchGrowthScalar = growthScalar * 0.3;
function enlargeGrowingFaces(snowflake, scale) {
    snowflake.faces.growing.forEach(function (face) {
        face.size += 0.75 * scale * growthScalar * face.growthScale;
        if (face.direction !== 'none') {
            var dx = 0.75 * 1 * scale * growthScalar * Math.cos(directions[face.direction]) * face.growthScale;
            var dy = 0.75 * 1 * scale * growthScalar * Math.sin(directions[face.direction]) * face.growthScale;
            face.center.x += dx;
            face.center.y += dy;
        }
    });
}
function enlargeGrowingBranches(snowflake, scale) {
    snowflake.branches.growing.forEach(function (branch) {
        var lengthScalar = -1.5 * scale + 1.5;
        var sizeScalar = 1.5 * scale;
        branch.size += sizeScalar * branchGrowthScalar * branch.growthScale;
        branch.length += lengthScalar * growthScalar * branch.growthScale;
    });
}
function addBranchesToGrowingFaces(snowflake) {
    snowflake.faces.growing.forEach(function (face) {
        snowflake.faces.waiting.push(face);
        addBranchesToFace(snowflake, face);
    });
}
function addFacesToGrowingBranches(snowflake) {
    snowflake.branches.growing.forEach(function (branch) {
        snowflake.branches.waiting.push(branch);
        addFaceToBranch(snowflake, branch);
    });
}
function addBranchesToFace(snowflake, face) {
    var initialFraction = 0.01;
    var sizeOfNewBranches = face.size * initialFraction;
    var distFromCenter = 1 * face.size * (1 - initialFraction);
    var cx = face.center.x;
    var cy = face.center.y;
    var _a = (function () {
        if (face.direction === 'none') {
            return [0, 6];
        }
        return [
            previousDirection(face.direction),
            3,
        ];
    })(), startDir = _a[0], numDirs = _a[1];
    var dir = startDir;
    var _loop_1 = function (i) {
        var x = cx + distFromCenter * Math.cos(directions[dir]);
        var y = cy + distFromCenter * Math.sin(directions[dir]);
        var growthScale = (function () {
            if (face.direction === 'none' || i === 1) {
                return face.growthScale * 0.9;
            }
            //const randomAdjust = Math.random() * 0.5 + 0.5;
            var randomAdjust = 1;
            return face.growthScale * 0.5 * randomAdjust;
        })();
        snowflake.branches.growing.push({
            rayHits: 0,
            start: { x: x, y: y },
            size: sizeOfNewBranches,
            length: 0,
            direction: dir,
            growthScale: growthScale,
            id: getId(snowflake),
        });
        dir = nextDirection(dir);
    };
    for (var i = 0; i < numDirs; i += 1) {
        _loop_1(i);
    }
}
function getId(snowflake) {
    return snowflake.faces.waiting.length + snowflake.faces.grown.length
        + snowflake.branches.growing.length + snowflake.branches.grown.length;
}
function addFaceToBranch(snowflake, branch) {
    snowflake.faces.growing.push({
        center: branchEnd(branch),
        size: branch.size,
        direction: branch.direction,
        growthScale: branch.growthScale,
        id: getId(snowflake),
    });
}
function clamp(x, low, high) {
    return Math.min(Math.max(x, low), high);
}
function createRandomGrowthInput() {
    var result = [0];
    for (var i = 0; i < 16; i++) {
        result[i] = Math.floor(Math.random() * 9);
    }
    return result;
}
var growthInput = createRandomGrowthInput();
var yChoices = [-1, -0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75, 1];
function drawGraphHandle(graph, x, y, isSelected, isBeingDragged) {
    var oldFillStyle = graph.ctx.fillStyle;
    var oldStrokeStyle = graph.ctx.strokeStyle;
    var oldLineDash = graph.ctx.getLineDash();
    var newStyle = 'black';
    var outerRingRadius = (function () {
        if (isSelected) {
            return 8;
        }
        else {
            return 5;
        }
    })();
    var newLineDash = (function () {
        if (isBeingDragged) {
            return [2, 2];
        }
        else {
            return [];
        }
    })();
    graph.ctx.beginPath();
    graph.ctx.arc(x, y, 3, 0, 2 * Math.PI);
    graph.ctx.closePath();
    graph.ctx.fillStyle = newStyle;
    graph.ctx.fill();
    graph.ctx.closePath();
    graph.ctx.beginPath();
    graph.ctx.arc(x, y, outerRingRadius, 0, 2 * Math.PI);
    graph.ctx.strokeStyle = newStyle;
    graph.ctx.setLineDash(newLineDash);
    graph.ctx.stroke();
    graph.ctx.fillStyle = oldFillStyle;
    graph.ctx.strokeStyle = oldStrokeStyle;
    graph.ctx.setLineDash(oldLineDash);
}
function growthHandlePosition(writableGraphWidth, writableGraphHeight, graphMargin, i) {
    return {
        x: writableGraphWidth / (growthInput.length - 1) * i + graphMargin,
        y: 4 * yChoices[growthInput[i]] * (writableGraphHeight / yChoices.length) + writableGraphHeight * 0.5,
    };
}
function nearestGrowthHandle(state, canvasPoint) {
    var writableGraphWidth = state.writableGraphWidth, writableGraphHeight = state.writableGraphHeight, graphMargin = state.graphMargin;
    var nearestDist = Infinity;
    var nearest = 0;
    for (var i = 0; i < growthInput.length; i += 1) {
        var p = growthHandlePosition(writableGraphWidth, writableGraphHeight, graphMargin, i);
        var dx = p.x - canvasPoint.x;
        var dist = dx * dx;
        if (dist < nearestDist) {
            nearestDist = dist;
            nearest = i;
        }
    }
    return nearest;
}
function drawGrowthInput(state) {
    var graph = state.graph, writableGraphWidth = state.writableGraphWidth, writableGraphHeight = state.writableGraphHeight, graphMargin = state.graphMargin, step = state.step, maxSteps = state.maxSteps;
    var dx = writableGraphWidth / (growthInput.length - 1);
    var dy = writableGraphHeight / yChoices.length;
    var percentDone = step / maxSteps;
    var old = graph.ctx.fillStyle;
    graph.ctx.fillStyle = graph.background;
    graph.ctx.fillRect(graphMargin, 0, writableGraphWidth * percentDone, writableGraphHeight);
    graph.ctx.fillStyle = old;
    graph.ctx.beginPath();
    {
        var p = growthHandlePosition(writableGraphWidth, writableGraphHeight, graphMargin, 0);
        graph.ctx.moveTo(p.x, p.y);
    }
    for (var i = 1; i < growthInput.length; i += 1) {
        var p = growthHandlePosition(writableGraphWidth, writableGraphHeight, graphMargin, i);
        graph.ctx.lineTo(p.x, p.y);
    }
    graph.ctx.strokeStyle = 'black';
    graph.ctx.stroke();
    for (var i = 0; i < growthInput.length; i += 1) {
        var p = growthHandlePosition(writableGraphWidth, writableGraphHeight, graphMargin, i);
        if (graph.graphMouse !== undefined) {
            var nearest = nearestGrowthHandle(state, graph.graphMouse);
            drawGraphHandle(graph, p.x, p.y, i === nearest, i === graph.handleBeingDragged);
        }
        else {
            drawGraphHandle(graph, p.x, p.y, false, false);
        }
    }
    graph.ctx.beginPath();
    var progressX = writableGraphWidth * percentDone + graphMargin;
    graph.ctx.moveTo(progressX, 0);
    graph.ctx.lineTo(progressX, writableGraphHeight);
    graph.ctx.strokeStyle = 'blue';
    graph.ctx.stroke();
    graph.ctx.beginPath();
    var xAxisY = writableGraphHeight * 0.5;
    graph.ctx.moveTo(graphMargin, xAxisY);
    graph.ctx.lineTo(writableGraphWidth + graphMargin, xAxisY);
    graph.ctx.strokeStyle = 'black';
    graph.ctx.setLineDash([2, 2]);
    graph.ctx.stroke();
    graph.ctx.setLineDash([]);
    //const facetingMetrics = graph.ctx.measureText("faceting");
    //const branchingMetrics = graph.ctx.measureText("branching");
    //graph.ctx.fillText(
    //  "faceting",
    //  writableGraphWidth - facetingMetrics.width,
    //  writableGraphHeight * 0.5 - facetingMetrics.actualBoundingBoxAscent,
    //);
    //graph.ctx.fillText(
    //  "branching",
    //  writableGraphWidth - branchingMetrics.width,
    //  writableGraphHeight * 0.5 + branchingMetrics.actualBoundingBoxAscent,
    //);
}
function lerp(a, b, n) {
    return (1 - n) * a + n * b;
}
function fracPart(n) {
    return n % 1;
}
function interpretGrowth(time) {
    var s = lerp(0, growthInput.length - 1, time);
    var n = fracPart(s);
    var a = yChoices[growthInput[Math.floor(s)]];
    var b = yChoices[growthInput[Math.ceil(s)]];
    var signedScale = lerp(a, b, n);
    var timeScalar = -0.01 * s + 1;
    return {
        scale: timeScalar * Math.abs(signedScale),
        growthType: signedScale > 0.0 ? 'branching' : 'faceting',
    };
}
function buildRay(theta) {
    var radius = 10;
    return {
        start: {
            x: radius * Math.cos(theta),
            y: radius * Math.sin(theta),
        },
    };
}
function drawRay(graphic, ray) {
    var start = worldToViewTransform(graphic, ray.start);
    var end = worldToViewTransform(graphic, { x: 0, y: 0 });
    graphic.ctx.beginPath();
    graphic.ctx.moveTo(start.x, start.y);
    graphic.ctx.lineTo(end.x, end.y);
    graphic.ctx.closePath();
    graphic.ctx.stroke();
}
function squareDistance(p1, p2) {
    var dx = p2.x - p1.x;
    var dy = p2.y - p1.y;
    return dx * dx + dy * dy;
}
function distance(p1, p2) {
    return Math.sqrt(squareDistance(p1, p2));
}
//function recordRayIntersections(snowflake: Snowflake, ray: Ray): void {
//  const r = (() => {
//    const r1 = firstRayFaceIntersection(snowflake.faces, ray);
//    const r2 = firstRayBranchIntersection(snowflake.branches, ray);
//    if (r1 === undefined) {
//      return r2;
//    }
//    return r1;
//  })();
//}
function createCirclesAlongBranch(branch) {
    if (branch.size === 0) {
        return [];
    }
    var result = [];
    var numCircles = Math.min(Math.ceil(branch.length / branch.size), 10);
    var end = branchEnd(branch);
    var dx = (end.x - branch.start.x) / numCircles;
    var dy = (end.y - branch.start.y) / numCircles;
    var radius = Math.max(branch.size, 0.01);
    for (var i = 0; i <= numCircles; i += 1) {
        var x = branch.start.x + dx * i;
        var y = branch.start.y + dy * i;
        result.push({
            center: { x: x, y: y },
            radius: radius,
        });
    }
    return result;
}
function currentTime(state) {
    var step = state.step, maxSteps = state.maxSteps;
    return step / maxSteps;
}
function updateGraph(state) {
    var graph = state.graph, writableGraphHeight = state.writableGraphHeight;
    if (graph.handleBeingDragged !== undefined || graph.mouseRecentlyExitedGraph) {
        graph.mouseRecentlyExitedGraph = false;
        var handle = (function () {
            if (graph.handleBeingDragged === 'needs lookup' && graph.graphMouse !== undefined) {
                return nearestGrowthHandle(state, graph.graphMouse);
            }
            else {
                return graph.handleBeingDragged;
            }
        })();
        if (graph.handleBeingDragged === 'needs lookup') {
            graph.handleBeingDragged = handle;
        }
        if (graph.graphMouse !== undefined && handle !== 'needs lookup') {
            var dy = writableGraphHeight / yChoices.length;
            var i = Math.floor(graph.graphMouse.y / dy);
            if (handle !== undefined) {
                growthInput[handle] = clamp(i, 0, yChoices.length - 1);
            }
        }
    }
    var beingDragged = graph.handleBeingDragged !== undefined;
    var userSelectValue = beingDragged ? 'none' : 'auto';
    var setStyle = function (e) { return e.setAttribute('style', "user-select: ".concat(userSelectValue)); };
    Array.from(document.getElementsByClassName('graphLabel')).forEach(setStyle);
    Array.from(document.getElementsByClassName('control')).forEach(setStyle);
    var controlContainer = document.getElementById('controlContainer');
    if (controlContainer !== null) {
        setStyle(controlContainer);
    }
}
function deleteSortedElementsFromSortedArray(removeArray, elements) {
    var completed = 0;
    var removePos = 0;
    var elementPos = 0;
    while (removePos < removeArray.length) {
        if (removeArray[removePos] === elements[elementPos]) {
            elementPos += 1;
        }
        else {
            removeArray[completed] = removeArray[removePos];
            completed += 1;
        }
        removePos += 1;
    }
    removeArray.splice(completed);
}
function moveBranchesAndFaces(snowflake) {
    // snowflake.faces.waiting.splice(
    //   snowflake.faces.waiting.length,
    //   0,
    //   ...coveredGrowingFaces(snowflake.faces.growing, snowflake.faces.grown)
    // );
    // snowflake.branches.waiting.splice(
    //   snowflake.branches.waiting.length,
    //   0,
    //   ...coveredGrowingBranches(snowflake.branches.growing, snowflake.branches.grown)
    // );
    var _a, _b;
    var compareFace = function (f1, f2) { return f1.id - f2.id; };
    var compareBranch = function (b1, b2) { return b1.id - b2.id; };
    snowflake.faces.growing.sort(compareFace);
    snowflake.faces.grown.sort(compareFace);
    snowflake.faces.waiting.sort(compareFace);
    snowflake.branches.growing.sort(compareBranch);
    snowflake.branches.grown.sort(compareBranch);
    snowflake.branches.waiting.sort(compareBranch);
    deleteSortedElementsFromSortedArray(snowflake.faces.growing, snowflake.faces.waiting);
    deleteSortedElementsFromSortedArray(snowflake.branches.growing, snowflake.branches.waiting);
    (_a = snowflake.faces.grown).splice.apply(_a, __spreadArray([snowflake.faces.grown.length, 0], snowflake.faces.waiting, false));
    (_b = snowflake.branches.grown).splice.apply(_b, __spreadArray([snowflake.branches.grown.length, 0], snowflake.branches.waiting, false));
    snowflake.faces.waiting.splice(0);
    snowflake.branches.waiting.splice(0);
}
function update(state) {
    var snowflake = state.snowflake, graph = state.graph, graphic = state.graphic, maxSteps = state.maxSteps, controls = state.controls;
    if (state.step < maxSteps && controls.playing) {
        state.step += 1;
        var growth = interpretGrowth(currentTime(state));
        if (state.currentGrowthType === undefined) {
            state.currentGrowthType = growth.growthType;
        }
        if (state.currentGrowthType !== growth.growthType) {
            state.currentGrowthType = growth.growthType;
            if (state.currentGrowthType === 'branching') {
                addBranchesToGrowingFaces(snowflake);
            }
            else {
                addFacesToGrowingBranches(snowflake);
            }
        }
        moveBranchesAndFaces(snowflake);
        if (state.currentGrowthType === 'branching') {
            enlargeGrowingBranches(snowflake, growth.scale);
        }
        else {
            enlargeGrowingFaces(snowflake, growth.scale);
        }
        clearSnowflakeCanvas(graphic);
        drawSnowflake(graphic, snowflake);
    }
    updateGraph(state);
    graph.ctx.clearRect(0, 0, graph.canvas.width, graph.canvas.height);
    drawGrowthInput(state);
}
function clearSnowflakeCanvas(graphic) {
    graphic.ctx.clearRect(0, 0, graphic.canvas.width, graphic.canvas.height);
}
function test(cond, name) {
    if (!cond) {
        console.error("Test failure: ".concat(name));
    }
    else {
        console.log("Test success: ".concat(name));
    }
}
function testEq(a, b, name) {
    if (a === b) {
        console.log("Test success: ".concat(name));
    }
    else {
        console.error("Test failure: ".concat(name, "; ").concat(a, " === ").concat(b, " is false"));
    }
}
function testAbs(a, b, name, tol) {
    if (tol === void 0) { tol = 0.01; }
    if (Math.abs(a - b) < tol) {
        console.log("Test success: ".concat(name));
    }
    else {
        console.error("Test failure: ".concat(name, "; |").concat(a, " - ").concat(b, "| < ").concat(tol, " is false"));
    }
}
function arraysEqual(xs, ys) {
    if (xs === ys)
        return true;
    if (xs.length !== ys.length)
        return false;
    for (var i = 0; i < xs.length; i += 1) {
        if (xs[i] !== ys[i])
            return false;
    }
    return true;
}
function testDelete() {
    {
        var letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'];
        var vowels = ['a', 'e', 'i'];
        deleteSortedElementsFromSortedArray(letters, vowels);
        test(arraysEqual(letters, ['b', 'c', 'd', 'f', 'g', 'h']), "1: Letters was ".concat(letters));
    }
    {
        var letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        var vowels = ['a', 'e'];
        deleteSortedElementsFromSortedArray(letters, vowels);
        test(arraysEqual(letters, ['b', 'c', 'd', 'f', 'g', 'h']), "2: Letters was ".concat(letters));
    }
}
// Returns a side at the same hight as `side` but scaled by `scale`
// (scale=1 returns the same side, scale=2 returns twice side, etc.).
function biggerSide(side, scale) {
    return {
        left: side.left * scale,
        right: side.right * scale,
        height: side.height,
    };
}
// Rotates 'point' by 'theta' around (0,0)
function rotatePoint(point, theta) {
    return {
        x: point.x * Math.cos(theta) - point.y * Math.sin(theta),
        y: point.x * Math.sin(theta) + point.y * Math.cos(theta),
    };
}
function testRotatePoint() {
    {
        var p = { x: 10, y: 0 };
        var r1 = rotatePoint(p, Math.PI / 2);
        test(Math.abs(r1.x) < 0.01, "testRotatePoint1x: ".concat(r1.x));
        test(Math.abs(r1.y - 10) < 0.01, "testRotatePoint1y: ".concat(r1.y));
        var r2 = rotatePoint(p, Math.PI);
        test(Math.abs(r2.x + 10) < 0.01, "testRotatePoint2x: ".concat(r2.x));
        test(Math.abs(r2.y) < 0.01, "testRotatePoint2y: ".concat(r2.y));
    }
}
function getFacePoints(face) {
    var dir = face.direction === 'none' ? 0 : face.direction;
    var result = [];
    for (var i = 0; i < directions.length; i += 1) {
        var d = directions[(dir + i) % directions.length];
        result.push({
            x: face.center.x + face.size * Math.cos(d),
            y: face.center.y + face.size * Math.sin(d),
        });
    }
    return result;
}
function testGetFacePoints() {
    {
        var f = __assign(__assign({}, defaultFace), { center: { x: 0, y: 0 }, size: 10 });
        var ps = getFacePoints(f);
        testEq(ps.length, 6, "gfp_1a");
        testAbs(ps[0].x, 10, "gfp_1b");
        testAbs(ps[0].y, 0, "gfp_1c");
        testAbs(ps[1].x, 10 * Math.cos(oneSixthCircle), "gfp_1d");
        testAbs(ps[1].y, 10 * Math.sin(oneSixthCircle), "gfp_1e");
        testAbs(ps[2].x, 10 * Math.cos(2 * oneSixthCircle), "gfp_1f");
        testAbs(ps[2].y, 10 * Math.sin(2 * oneSixthCircle), "gfp_1g");
        testAbs(ps[2].y, ps[1].y, "gfp_1h");
        testAbs(ps[1].y, -ps[5].y, "gfp_1i");
    }
    {
        var f = __assign(__assign({}, defaultFace), { center: { x: 0, y: 0 }, size: 10, direction: 1 });
        var ps = getFacePoints(f);
        testEq(ps.length, 6, "gfp_b1");
        testAbs(ps[0].x, 10 * Math.cos(oneSixthCircle), "gfp_b2");
        testAbs(ps[0].y, 10 * Math.sin(oneSixthCircle), "gfp_b3");
    }
}
function branchStartFace(branch) {
    return __assign(__assign({}, defaultFace), { center: copyPoint(branch.start), size: branch.size, direction: branch.direction });
}
function branchEndFace(branch) {
    return __assign(__assign({}, defaultFace), { center: addPoints(branch.start, {
            x: branch.length * Math.cos(directions[branch.direction]),
            y: branch.length * Math.sin(directions[branch.direction]),
        }), size: branch.size, direction: branch.direction });
}
function getBranchPoints(branch) {
    var result = [];
    var startPoints = getFacePoints(branchStartFace(branch));
    var endPoints = getFacePoints(branchEndFace(branch));
    result.push(endPoints[0]);
    result.push(endPoints[1]);
    result.push(startPoints[2]);
    result.push(startPoints[3]);
    result.push(startPoints[4]);
    result.push(endPoints[5]);
    return result;
}
function testGetBranchPoints() {
    {
        var b = __assign(__assign({}, defaultBranch), { start: { x: 0, y: 0 }, direction: 0, length: 10, size: 1 });
        var p = getBranchPoints(b);
        testEq(p.length, 6, "gbp_a1");
        testAbs(p[0].x, 11, "gbp_a2");
        testAbs(p[0].y, 0, "gbp_a3");
        testAbs(p[5].x, 10 + Math.cos(5 * oneSixthCircle), "gbp_a4");
        testAbs(p[5].y, Math.sin(5 * oneSixthCircle), "gbp_a5");
    }
}
function getBranchSide2Ds(branch) {
    var points = getBranchPoints(branch);
    var result = [];
    for (var i = 0; i < directions.length; i += 1) {
        if (i === directions.length - 1) {
            result.push({ right: points[i], left: points[0] });
        }
        else {
            result.push({ right: points[i], left: points[i + 1] });
        }
    }
    return result;
}
function testGetBranchSide2Ds() {
    {
        var b = __assign(__assign({}, defaultBranch), { start: { x: 0, y: 0 }, size: 1, length: 10, direction: 2 });
        var p = getBranchSide2Ds(b);
        testEq(p.length, 6, "gbs_a1");
        testAbs(p[4].right.x, Math.cos(0 * oneSixthCircle), "gbs_a2");
        testAbs(p[4].right.y, Math.sin(0 * oneSixthCircle), "gbs_a3");
        testAbs(p[4].left.x, 10 * Math.cos(2 * oneSixthCircle) + Math.cos(oneSixthCircle), "gbs_a4");
        testAbs(p[4].left.y, 10 * Math.sin(2 * oneSixthCircle) + Math.sin(oneSixthCircle), "gbs_a5");
        testAbs(p[3].right.x, Math.cos(5 * oneSixthCircle), "gbs_a6");
        testAbs(p[3].right.y, Math.sin(5 * oneSixthCircle), "gbs_a7");
        testAbs(p[3].left.x, p[4].right.x, "gbs_a8");
        testAbs(p[3].left.y, p[4].right.y, "gbs_a9");
    }
}
function getNormalizedBranchSides(branch) {
    return getBranchSide2Ds(branch).map(function (s, i) {
        var theta = oneSixthCircle * (1 - i);
        var left = rotatePoint(s.left, theta);
        var right = rotatePoint(s.right, theta);
        return {
            left: left.x,
            right: right.x,
            height: left.y,
        };
    });
}
function getFaceSide2Ds(face) {
    var points = getFacePoints(face);
    var result = [];
    for (var i = 0; i < directions.length; i += 1) {
        if (i === directions.length - 1) {
            result.push({ right: points[i], left: points[0] });
        }
        else {
            result.push({ right: points[i], left: points[i + 1] });
        }
    }
    return result;
}
function testGetFaceSide2Ds() {
    {
        var f = __assign(__assign({}, defaultFace), { center: { x: 0, y: 0 }, size: 10 });
        var s = getFaceSide2Ds(f);
        var p = getFacePoints(f);
        testEq(s.length, 6, "gfp_a1");
        testEq(p.length, 6, "gfp_a2");
        testAbs(s[0].right.x, p[0].x, "gfp_a3");
        testAbs(s[0].left.x, p[1].x, "gfp_a4");
        testAbs(s[0].right.y, p[0].y, "gfp_a5");
        testAbs(s[0].left.y, p[1].y, "gfp_a6");
        testAbs(s[5].left.x, p[0].x, "gfp_a7");
        testAbs(s[5].left.y, p[0].y, "gfp_a8");
        testAbs(s[5].right.x, p[5].x, "gfp_a9");
        testAbs(s[5].right.x, p[5].x, "gfp_a10");
    }
}
// Returns a Side calculated by rotating 'side2d' around the origin
// until it is horizontal. 'absoluteDirection' should be the
// non-relative number of the side, starting from the rightmost upward
// side and going counterclockwise.
function normalizeSide2D(side2d, absoluteDirection) {
    var theta = oneSixthCircle * (1 - absoluteDirection);
    var left = rotatePoint(side2d.left, theta);
    var right = rotatePoint(side2d.right, theta);
    return {
        left: left.x,
        right: right.x,
        height: left.y,
    };
}
// Returns an array of sides of the face but where every side is
// rotated around the origin so that it is horizontal. The sides are
// returned in counterclockwise order starting with the side touching
// the vertex in the face's direction and going counterclockwise away
// from it.
function getNormalizedFaceSides(face) {
    var dir = face.direction === "none" ? 0 : face.direction;
    return getFaceSide2Ds(face).map(function (s, i) {
        return normalizeSide2D(s, (i + dir) % directions.length);
    });
}
// const stopDistance = 0.001;
// const slowdownMultiplier = 0.999;
// const sideScale = 1.15;
// function coveredGrowingBranches(growingBranches: Array<Branch>, grownBranches: Array<Branch>): Array<Branch> {
//   const result: Array<Branch> = [];
//   const normalizedSideBranches: Array6XSideBranch = [[], [], [], [], [], []];
//   growingBranches.forEach(branch => {
//     getNormalizedBranchSides(branch).forEach((side, i) => {
//       let dir = branch.direction;
//       normalizedSideBranches[(i + dir) % directions.length].push({ side, branch, growing: true });
//     });
//   });
//   grownBranches.forEach(branch => {
//     getNormalizedBranchSides(branch).forEach((side, i) => {
//       let dir = branch.direction;
//       normalizedSideBranches[(i + dir) % directions.length].push({ side, branch, growing: false });
//     });
//   });
//   growingBranches.forEach(branch => {
//     let dir = branch.direction;
//     const normalizedSides = getNormalizedBranchSides(branch);
//     const leftSide = normalizedSides[0];
//     const leftAbsoluteDir = dir;
//     const rightSide = normalizedSides[directions.length - 1];
//     const rightAbsoluteDir = (directions.length - 1 + dir) % directions.length;
//     let coveredCount = 0;
//     for (let i = 0; i < normalizedSideBranches[leftAbsoluteDir].length; i += 1) {
//       const sideBranch = normalizedSideBranches[leftAbsoluteDir][i];
//       const overlap = overlaps(biggerSide(sideBranch.side, sideScale), leftSide);
//       if (overlap !== undefined && overlap < stopDistance) {
//         coveredCount += 1;
//         break;
//       } else if (overlap !== undefined) {
//         // branch.growthScale *= slowdownMultiplier;
//       }
//     }
//     for (let i = 0; i < normalizedSideBranches[rightAbsoluteDir].length; i += 1) {
//       const sideBranch = normalizedSideBranches[rightAbsoluteDir][i];
//       const overlap = overlaps(biggerSide(sideBranch.side, sideScale), rightSide);
//       if (overlap !== undefined && overlap < stopDistance) {
//         coveredCount += 1;
//         break;
//       } else if (overlap !== undefined) {
//         // branch.growthScale *= slowdownMultiplier;
//       }
//     }
//     if (coveredCount === 2) {
//       result.push(branch);
//     }
//   });
//   return result;
// }
// function coveredGrowingFaces(growingFaces: Array<Face>, grownFaces: Array<Face>): Array<Face> {
//   const result: Array<Face> = [];
//   const normalizedSideFaces: Array6XSideFace = [[], [], [], [], [], []];
//   growingFaces.forEach(face => {
//     getNormalizedFaceSides(face).forEach((side, i) => {
//       let dir = face.direction === "none" ? 0 : face.direction;
//       normalizedSideFaces[(i + dir) % directions.length].push({ side, face, growing: true });
//     });
//   });
//   grownFaces.forEach(face => {
//     getNormalizedFaceSides(face).forEach((side, i) => {
//       let dir = face.direction === "none" ? 0 : face.direction;
//       normalizedSideFaces[(i + dir) % directions.length].push({ side, face, growing: false });
//     });
//   });
//   growingFaces.forEach(face => {
//     let dir = face.direction === "none" ? 0 : face.direction;
//     const normalizedSides = getNormalizedFaceSides(face);
//     const leftSide = normalizedSides[0];
//     const leftAbsoluteDir = dir;
//     const rightSide = normalizedSides[directions.length - 1];
//     const rightAbsoluteDir = (directions.length - 1 + dir) % directions.length;
//     let coveredCount = 0;
//     for (let i = 0; i < normalizedSideFaces[leftAbsoluteDir].length; i += 1) {
//       const sideFace = normalizedSideFaces[leftAbsoluteDir][i];
//       const overlap = overlaps(biggerSide(sideFace.side, sideScale), leftSide);
//       if (overlap !== undefined && overlap < stopDistance) {
//         coveredCount += 1;
//         break;
//       } else if (overlap !== undefined) {
//         face.growthScale *= slowdownMultiplier;
//       }
//     }
//     for (let i = 0; i < normalizedSideFaces[rightAbsoluteDir].length; i += 1) {
//       const sideFace = normalizedSideFaces[rightAbsoluteDir][i];
//       const overlap = overlaps(biggerSide(sideFace.side, sideScale), rightSide)
//       if (overlap !== undefined && overlap < stopDistance) {
//         coveredCount += 1;
//         break;
//       } else if (overlap !== undefined) {
//         face.growthScale *= slowdownMultiplier;
//       }
//     }
//     if (coveredCount === 2) {
//       result.push(face);
//     }
//   });
//   return result;
// }
function testGetNormalizedFaceSides() {
    {
        var f = __assign(__assign({}, defaultFace), { size: 10, direction: 0, center: { x: 0, y: 0 } });
        var s = getNormalizedFaceSides(f);
        var left = 10 * Math.cos(2 * oneSixthCircle);
        var right = 10 * Math.cos(oneSixthCircle);
        var height = 10 * Math.sin(oneSixthCircle);
        for (var t = 0; t < 6; t += 1) {
            testAbs(s[t].left, left, "norm_a".concat(t, "_left"));
            testAbs(s[t].right, right, "norm_a".concat(t, "_right"));
            testAbs(s[t].height, height, "norm_a".concat(t, "_height"));
        }
    }
    {
        var s = directions.map(function (d, i) {
            if (isDirection(i)) {
                var f = __assign(__assign({}, defaultFace), { size: 10, direction: i, center: rotatePoint({ x: 50, y: 0 }, d) });
                return [getFaceSide2Ds(f), getNormalizedFaceSides(f)];
            }
            else {
                console.error('problem in norm');
                return [getFaceSide2Ds(defaultFace), getNormalizedFaceSides(defaultFace)];
            }
        });
        testAbs(s[0][1][0].left, s[1][0][0].left.x, "norm_b1");
        testAbs(s[0][1][0].right, s[1][0][0].right.x, "norm_b2");
        testAbs(s[5][1][5].left, s[1][0][5].left.x, "norm_b3");
        testAbs(s[5][1][5].right, s[1][0][5].right.x, "norm_b4");
        testAbs(s[0][1][1].left, s[0][0][1].left.x, "norm_b5");
        testAbs(s[0][1][1].right, s[0][0][1].right.x, "norm_b6");
    }
}
function makeState() {
    var graph = makeGraph();
    var graphic = makeGraphic();
    if (graph === undefined || graphic === undefined) {
        console.error("Couldn't get drawing context");
        return undefined;
    }
    var snowflake = createInitialSnowflake();
    var currentGrowthType = undefined;
    var graphMargin = 10;
    var writableGraphWidth = graph.canvas.width - 2 * graphMargin;
    var writableGraphHeight = graph.canvas.height;
    var controls = makeControls(graphic);
    var step = 0;
    var intervalId = undefined;
    var updateInterval = 5;
    var maxSteps = 1000;
    return {
        graph: graph,
        graphic: graphic,
        snowflake: snowflake,
        currentGrowthType: currentGrowthType,
        graphMargin: graphMargin,
        writableGraphWidth: writableGraphWidth,
        writableGraphHeight: writableGraphHeight,
        controls: controls,
        step: step,
        intervalId: intervalId,
        updateInterval: updateInterval,
        maxSteps: maxSteps,
    };
}
function resetSnowflake(state) {
    state.snowflake = createInitialSnowflake();
    state.step = 0;
    state.currentGrowthType = undefined;
    clearSnowflakeCanvas(state.graphic);
}
// Returns how far above s1 is from s2 if s1 is above and overlapping
// s2, otherwise returns undefined.
function overlaps(s1, s2) {
    if (s1.height > s2.height &&
        (s1.left < s2.left && s1.right > s2.left ||
            s1.left > s2.left && s2.right > s1.left ||
            s1.left < s2.left && s1.right > s2.right ||
            s1.left > s2.left && s1.right < s2.right)) {
        return s1.height - s2.height;
    }
    return undefined;
}
function testOverlaps() {
    function s(left, right, height) {
        return { left: left, right: right, height: height };
    }
    {
        test(overlaps(s(0, 2, 1), s(1, 3, 0)) !== undefined, "ol1");
        test(overlaps(s(1, 3, 1), s(0, 2, 0)) !== undefined, "ol2");
        test(overlaps(s(0, 3, 1), s(1, 2, 0)) !== undefined, "ol3");
        test(overlaps(s(1, 2, 1), s(0, 3, 0)) !== undefined, "ol4");
        test(!overlaps(s(0, 2, 0), s(1, 3, 1)) !== undefined, "ol5");
        test(!overlaps(s(1, 3, 0), s(0, 2, 1)) !== undefined, "ol6");
        test(!overlaps(s(0, 3, 0), s(1, 2, 1)) !== undefined, "ol7");
        test(!overlaps(s(1, 2, 0), s(0, 3, 1)) !== undefined, "ol8");
        test(!overlaps(s(0, 1, 1), s(2, 3, 0)) !== undefined, "ol9");
        test(!overlaps(s(2, 3, 1), s(0, 1, 0)) !== undefined, "ol10");
        test(!overlaps(s(0, 1, 0), s(2, 3, 1)) !== undefined, "ol11");
        test(!overlaps(s(2, 3, 0), s(0, 1, 1)) !== undefined, "ol12");
    }
}
// function waitingFaces(faces: Array<Face>, direction: Direction): Array<Face> {
//   const sections: Array<Section<Face>> = [];
//   faces.forEach(part => {
//     getNormalizedFaceSides(part).forEach(side => {
//       sections.push({ side, part });
//     });
//   });
//   sections.sort((a, b) => a.side.height - b.side.height);
//   const top: Array<Section<Face>> = [];
//   const waitingFaces: Array<Face> = [];
//   sections.forEach(s => {
//     const overlappedSections: Array<Section<Face>> = insertSectionIntoTop(s, top);
//     overlappedSections.forEach(o => waitingFaces.push(o.part));
//   });
//   return []; // fixme
// }
(function () {
    var state = makeState();
    if (state === undefined) {
        return;
    }
    registerControlsEventListeners(state);
    state.intervalId = window.setInterval(function () { return update(state); }, state.updateInterval);
})();
var enableTests = true;
if (enableTests) {
    testDelete();
    testRotatePoint();
    testGetFacePoints();
    testGetFaceSide2Ds();
    testGetNormalizedFaceSides();
    testGetBranchPoints();
    testGetBranchSide2Ds();
    testOverlaps();
}
