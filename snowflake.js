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
    var lightBlue = 'rgba(90, 211, 255, 1.0)';
    ctx.fillStyle = lightBlue;
    return { canvas: canvas, ctx: ctx };
}
var graphic = makeGraphic();
function makeGraph() {
    var canvas = document.getElementById('graph');
    var ctx = canvas.getContext('2d');
    var graphMouse = { x: 0, y: 0 };
    var background = 'rgba(90, 211, 255, 0.5)';
    var result = {
        canvas: canvas,
        ctx: ctx,
        handleBeingDragged: undefined,
        mouseRecentlyExitedGraph: false,
        graphMouse: graphMouse,
        background: background
    };
    canvas.addEventListener('mousemove', function (e) {
        graphMouse.x = e.offsetX;
        graphMouse.y = e.offsetY;
    });
    canvas.addEventListener('mousedown', function (e) {
        result.handleBeingDragged = 'needs lookup';
    });
    canvas.addEventListener('mouseup', function (e) {
        result.handleBeingDragged = undefined;
    });
    canvas.addEventListener('mouseleave', function (e) {
        result.mouseRecentlyExitedGraph = true;
    });
    return result;
}
;
var graph = makeGraph();
function makeControls() {
    var pause = document.getElementById('pause');
    var reset = document.getElementById('reset');
    var result = { pause: pause, reset: reset, playing: true };
    pause.addEventListener('click', function (e) {
        result.playing = !result.playing;
        if (result.playing) {
            pause.innerHTML = 'pause';
            graphic.canvas.className = '';
        }
        else {
            pause.innerHTML = 'play';
            graphic.canvas.className = 'paused';
        }
    });
    reset.addEventListener('click', function (e) {
        resetSnowflake();
    });
    return result;
}
var controls = makeControls();
var oneSixthCircle = Math.PI * 2 / 6;
var directions = [
    0 * oneSixthCircle,
    1 * oneSixthCircle,
    2 * oneSixthCircle,
    3 * oneSixthCircle,
    4 * oneSixthCircle,
    5 * oneSixthCircle,
];
function parseDirection(i) {
    if (i === 0 || i === 1 || i === 2 ||
        i === 3 || i === 4 || i === 5) {
        return i;
    }
    return undefined;
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
    rayHits: 0,
    center: defaultPoint,
    size: 0.0025,
    direction: 'none',
    growthScale: 1
};
var defaultBranch = {
    rayHits: 0,
    start: defaultPoint,
    size: 0.0025,
    length: 0.005,
    direction: 0,
    growthScale: 1
};
function branchEnd(branch) {
    var d = directions[branch.direction];
    var l = branch.length;
    var x = branch.start.x + l * Math.cos(d);
    var y = branch.start.y + l * Math.sin(d);
    return { x: x, y: y };
}
function drawSnowflake(snowflake) {
    snowflake.faces.growing.forEach(drawFace);
    snowflake.faces.grown.forEach(drawFace);
    snowflake.branches.growing.forEach(drawBranch);
    snowflake.branches.grown.forEach(drawBranch);
}
function worldToViewTransform(p) {
    var w = graphic.canvas.width;
    var h = graphic.canvas.height;
    // affine transform:
    // |r.x|   |w/2   0   w/2|   |p.x|
    // |r.y| = |0   -h/2  h/2| * |p.y|
    // | 1 |   |0     0    1 |   | 1 |
    var r = {
        x: p.x * w * 0.5 + w * 0.5,
        y: p.y * -h * 0.5 + h * 0.5
    };
    return r;
}
function drawFace(face) {
    graphic.ctx.beginPath();
    getFacePoints(face).forEach(function (p, i) {
        var _a = worldToViewTransform(p), x = _a.x, y = _a.y;
        if (i === 0) {
            graphic.ctx.moveTo(x, y);
        }
        else {
            graphic.ctx.lineTo(x, y);
        }
    });
    graphic.ctx.closePath();
    graphic.ctx.fillStyle = 'rgba(0, 0, 255, 0.2)';
    graphic.ctx.fill();
}
function rem(x, m) {
    return ((x % m) + m) % m;
}
function drawBranch(branch) {
    graphic.ctx.beginPath();
    getBranchPoints(branch).forEach(function (p, i) {
        var _a = worldToViewTransform(p), x = _a.x, y = _a.y;
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
function toCanvasSize(n) {
    var smallestDimension = Math.min(graphic.canvas.width, graphic.canvas.height);
    return n * smallestDimension;
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
                    rayHits: 0,
                    center: { x: 0, y: 0 },
                    size: 0.0025,
                    direction: 'none',
                    growthScale: 1
                }],
            grown: [],
            waiting: []
        },
        branches: { growing: [], grown: [], waiting: [] }
    };
}
var growthScalar = 0.0001;
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
            var randomAdjust = 1;
            return face.growthScale * 0.5 * randomAdjust;
        })();
        snowflake.branches.growing.push({
            rayHits: 0,
            start: { x: x, y: y },
            size: sizeOfNewBranches,
            length: 0,
            direction: dir,
            growthScale: growthScale
        });
        dir = nextDirection(dir);
    };
    for (var i = 0; i < numDirs; i += 1) {
        _loop_1(i);
    }
}
function addFaceToBranch(snowflake, branch) {
    snowflake.faces.growing.push({
        rayHits: 0,
        center: branchEnd(branch),
        size: branch.size,
        direction: branch.direction,
        growthScale: branch.growthScale
    });
}
function clamp(x, low, high) {
    return Math.min(Math.max(x, low), high);
}
var growthInput = [0, 5, 8, 8, 3, 5, 3, 2, 6, 3, 6, 3];
var yChoices = [-1, -0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75, 1];
function drawGraphHandle(x, y, isSelected, isBeingDragged) {
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
function growthHandlePosition(i) {
    return {
        x: writableGraphWidth / (growthInput.length - 1) * i + graphMargin,
        y: 4 * yChoices[growthInput[i]] * (writableGraphHeight / yChoices.length) + writableGraphHeight * 0.5
    };
}
function nearestGrowthHandle(canvasPoint) {
    var nearestDist = Infinity;
    var nearest = 0;
    for (var i = 0; i < growthInput.length; i += 1) {
        var p = growthHandlePosition(i);
        var dx = p.x - canvasPoint.x;
        var dist = dx * dx;
        if (dist < nearestDist) {
            nearestDist = dist;
            nearest = i;
        }
    }
    return nearest;
}
var graphMargin = 10;
var writableGraphWidth = graph.canvas.width - 2 * graphMargin;
var writableGraphHeight = graph.canvas.height;
function drawGrowthInput() {
    var dx = writableGraphWidth / (growthInput.length - 1);
    var dy = writableGraphHeight / yChoices.length;
    var percentDone = step / maxSteps;
    var old = graph.ctx.fillStyle;
    graph.ctx.fillStyle = graph.background;
    graph.ctx.fillRect(graphMargin, 0, writableGraphWidth * percentDone, writableGraphHeight);
    graph.ctx.fillStyle = old;
    graph.ctx.beginPath();
    {
        var p = growthHandlePosition(0);
        graph.ctx.moveTo(p.x, p.y);
    }
    for (var i = 1; i < growthInput.length; i += 1) {
        var p = growthHandlePosition(i);
        graph.ctx.lineTo(p.x, p.y);
    }
    graph.ctx.strokeStyle = 'black';
    graph.ctx.stroke();
    var nearest = nearestGrowthHandle(graph.graphMouse);
    for (var i = 0; i < growthInput.length; i += 1) {
        var p = growthHandlePosition(i);
        drawGraphHandle(p.x, p.y, i === nearest, i === graph.handleBeingDragged);
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
        growthType: signedScale > 0.0 ? 'branching' : 'faceting'
    };
}
function buildRay(theta) {
    var radius = 10;
    return {
        start: {
            x: radius * Math.cos(theta),
            y: radius * Math.sin(theta)
        }
    };
}
function drawRay(ray) {
    var start = worldToViewTransform(ray.start);
    var end = worldToViewTransform({ x: 0, y: 0 });
    graphic.ctx.beginPath();
    graphic.ctx.moveTo(start.x, start.y);
    graphic.ctx.lineTo(end.x, end.y);
    graphic.ctx.closePath();
    graphic.ctx.stroke();
}
function castRaysAtGrowingParts(snowflake) {
    snowflake.faces.growing.forEach(function (face) { return face.rayHits = 0; });
    snowflake.branches.growing.forEach(function (branch) { return branch.rayHits = 0; });
    var numRays = 200;
    var theta = Math.PI * 2 / numRays;
    for (var i = 0; i < numRays; i += 1) {
        var ray = buildRay(theta * i);
        var intersection = firstRayIntersection(snowflake, ray);
        if (intersection !== undefined) {
            intersection.rayHits += 1;
        }
    }
    snowflake.faces.growing.forEach(function (face) {
        if (face.rayHits === 0) {
            snowflake.faces.waiting.push(face);
        }
    });
    snowflake.branches.growing.forEach(function (branch) {
        if (branch.rayHits === 0) {
            snowflake.branches.waiting.push(branch);
        }
    });
}
function squareDistance(p1, p2) {
    var dx = p2.x - p1.x;
    var dy = p2.y - p1.y;
    return dx * dx + dy * dy;
}
function distance(p1, p2) {
    return Math.sqrt(squareDistance(p1, p2));
}
function firstRayIntersection(snowflake, ray) {
    var smallestDistance = Infinity;
    var smallestDistancePoint = undefined;
    var result = undefined;
    function updateIntersection(i, v, r) {
        if (i === undefined) {
            return;
        }
        if (smallestDistancePoint === undefined) {
            smallestDistancePoint = i;
        }
        var d = squareDistance(i, r.start);
        if (d < smallestDistance) {
            smallestDistance = d;
            smallestDistancePoint = i;
            result = v;
        }
    }
    snowflake.faces.growing.forEach(function (face) {
        var circle = {
            center: copyPoint(face.center),
            radius: face.size
        };
        circle.radius = Math.max(circle.radius, 0.01);
        var intersection = findCircleRayIntersection(circle, ray);
        updateIntersection(intersection, face, ray);
    });
    snowflake.branches.growing.forEach(function (branch) {
        createCirclesAlongBranch(branch).forEach(function (circle) {
            var intersection = findCircleRayIntersection(circle, ray);
            updateIntersection(intersection, branch, ray);
        });
    });
    return result;
}
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
            radius: radius
        });
    }
    return result;
}
//function firstRayFaceIntersection(
//  faces: Array<Face>, ray: Ray
//): MaybeRayHit<Face> {
//  const smallestDistance = Infinity;
//  let result = undefined;
//
//  for (let i = 0; i < faces.length; i += 1) {
//    const face = faces[i];
//    const circle = {
//      center: copyPoint(face.center),
//      radius: face.size,
//    };
//    const maybeIntersection = findCircleRayIntersection(circle, ray);
//    if (maybeIntersection !== undefined) {
//      const dist = squareDistance(ray.start, circle.center);
//      if (dist < smallestDistance) {
//        result = {
//          ray,
//          hit: face,
//        };
//      }
//    }
//  }
//
//  return result;
//}
// Returns the point on the circle's circumference that intersects a straight
// line that passes through 'ray.start' and (0,0); or undefined, if there isn't
// such an intersection. If there are two such points, it returns the one
// furthest from the (0,0).
function findCircleRayIntersection(circle, ray) {
    var rx = ray.start.x;
    var ry = ray.start.y;
    var cx = circle.center.x;
    var cy = circle.center.y;
    var cr = circle.radius;
    var cr2 = cr * cr;
    var cx2 = cx * cx;
    var cy2 = cy * cy;
    var rx2 = rx * rx;
    var ry2 = ry * ry;
    var t1 = (cr2 - cx2) * ry2 + 2 * cx * cy * rx * ry + (cr2 - cy2) * rx2;
    if (t1 < 0) {
        return undefined;
    }
    var t1sqrt = Math.sqrt(t1);
    var t2 = cy * rx * ry + cx * rx2;
    var t3 = cy * ry2 + cx * rx * ry;
    var t4 = ry2 + rx2;
    var ix = (rx * t1sqrt + t2) / t4;
    var iy = (ry * t1sqrt + t3) / t4;
    return { x: ix, y: iy };
}
function testFindCircleRayIntersection() {
    var circle = {
        center: {
            x: 4.4,
            y: -6.5
        },
        radius: 6
    };
    var ray = {
        start: {
            x: 18,
            y: -11.6
        }
    };
    var r1 = findCircleRayIntersection(circle, ray);
    test(Math.abs(r1.x - 10.39) < 0.01, "testFindRayCircleIntersection1");
    test(Math.abs(r1.y - -6.70) < 0.01, "testFindRayCircleIntersection2");
}
function rayCircleDiscriminant(ray, circle) {
    // from https://mathworld.wolfram.com/Circle-LineIntersection.html
    var x1 = ray.start.x - circle.center.x;
    var y1 = ray.start.y - circle.center.y;
    var x2 = -circle.center.x;
    var y2 = -circle.center.y;
    var r = circle.radius;
    var dx = x2 - x1;
    var dy = y2 - y1;
    var dr = Math.sqrt(dx * dx + dy * dy);
    var D = x1 * y2 - x2 * y1;
    var discriminant = r * r * dr - D * D;
    return discriminant;
}
var updateInterval = 5;
var maxSteps = 6000;
var snowflake = createInitialSnowflake();
var step = 0;
var intervalId = undefined;
var currentGrowthType = undefined;
function resetSnowflake() {
    snowflake = createInitialSnowflake();
    step = 0;
    currentGrowthType = undefined;
    clearSnowflakeCanvas();
}
function currentTime() {
    return step / maxSteps;
}
function updateGraph() {
    if (graph.handleBeingDragged !== undefined || graph.mouseRecentlyExitedGraph) {
        graph.mouseRecentlyExitedGraph = false;
        var handle = (function () {
            if (graph.handleBeingDragged === 'needs lookup') {
                return nearestGrowthHandle(graph.graphMouse);
            }
            else {
                return graph.handleBeingDragged;
            }
        })();
        if (graph.handleBeingDragged === 'needs lookup') {
            graph.handleBeingDragged = handle;
        }
        var dy = writableGraphHeight / yChoices.length;
        var i = Math.floor(graph.graphMouse.y / dy);
        growthInput[handle] = clamp(i, 0, yChoices.length - 1);
        //while (growthInput[handle] > 0 && growthHandlePosition(handle).y > graph.graphMouse.y) {
        //  growthInput[handle] -= 1;
        //}
        //while (growthInput[handle] < yChoices.length && growthHandlePosition(handle).y < graph.graphMouse.y) {
        //  growthInput[handle] += 1;
        //}
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
function moveBranchesAndFaces() {
    var _a, _b;
    deleteSortedElementsFromSortedArray(snowflake.faces.growing, snowflake.faces.waiting);
    deleteSortedElementsFromSortedArray(snowflake.branches.growing, snowflake.branches.waiting);
    (_a = snowflake.faces.grown).splice.apply(_a, __spreadArray([snowflake.faces.grown.length, 0], snowflake.faces.waiting, false));
    (_b = snowflake.branches.grown).splice.apply(_b, __spreadArray([snowflake.branches.grown.length, 0], snowflake.branches.waiting, false));
    snowflake.faces.waiting.splice(0);
    snowflake.branches.waiting.splice(0);
}
function update() {
    if (step < maxSteps && controls.playing) {
        step += 1;
        castRaysAtGrowingParts(snowflake);
        var growth = interpretGrowth(currentTime());
        if (currentGrowthType === undefined) {
            currentGrowthType = growth.growthType;
        }
        if (currentGrowthType !== growth.growthType) {
            currentGrowthType = growth.growthType;
            if (currentGrowthType === 'branching') {
                addBranchesToGrowingFaces(snowflake);
            }
            else {
                addFacesToGrowingBranches(snowflake);
            }
        }
        moveBranchesAndFaces();
        if (currentGrowthType === 'branching') {
            enlargeGrowingBranches(snowflake, growth.scale);
        }
        else {
            enlargeGrowingFaces(snowflake, growth.scale);
        }
        clearSnowflakeCanvas();
        drawSnowflake(snowflake);
    }
    updateGraph();
    graph.ctx.clearRect(0, 0, graph.canvas.width, graph.canvas.height);
    drawGrowthInput();
}
function clearSnowflakeCanvas() {
    graphic.ctx.clearRect(0, 0, graphic.canvas.width, graphic.canvas.height);
}
intervalId = window.setInterval(update, updateInterval);
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
// Rotates 'point' by 'theta' around (0,0)
function rotatePoint(point, theta) {
    return {
        x: point.x * Math.cos(theta) - point.y * Math.sin(theta),
        y: point.x * Math.sin(theta) + point.y * Math.cos(theta)
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
            y: face.center.y + face.size * Math.sin(d)
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
            y: branch.length * Math.sin(directions[branch.direction])
        }), size: branch.size, direction: branch.direction });
}
function getBranchPoints(branch) {
    var result = [];
    var startPoints = getFacePoints(branchStartFace(branch));
    var endPoints = getFacePoints(branchEndFace(branch));
    result.push(startPoints[2]);
    result.push(startPoints[3]);
    result.push(startPoints[4]);
    result.push(endPoints[5]);
    result.push(endPoints[0]);
    result.push(endPoints[1]);
    return result;
}
function testGetBranchEndPoints() {
    {
        var b = __assign(__assign({}, defaultBranch), { start: { x: 0, y: 0 }, direction: 0, length: 10, size: 1 });
        var p = getBranchPoints(b);
        testEq(p.length, 6, "gbep_a1");
        testAbs(p[4].x, 11, "gbep_a2");
        testAbs(p[4].y, 0, "gbep_a3");
        testAbs(p[3].x, 10 + Math.cos(5 * oneSixthCircle), "gbep_a4");
        testAbs(p[3].y, Math.sin(5 * oneSixthCircle), "gbep_a5");
    }
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
// Returns an array of sides of the face but where every side is
// rotated around the origin so that it is horizontal.
function getNormalizedFaceSides(face) {
    return getFaceSide2Ds(face).map(function (s, i) {
        var theta = oneSixthCircle * (1 - i);
        var left = rotatePoint(s.left, theta);
        var right = rotatePoint(s.right, theta);
        return {
            left: left.x,
            right: right.x,
            height: left.y
        };
    });
}
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
            var f = __assign(__assign({}, defaultFace), { size: 10, direction: parseDirection(i), center: rotatePoint({ x: 50, y: 0 }, d) });
            return [getFaceSide2Ds(f), getNormalizedFaceSides(f)];
        });
        testAbs(s[0][1][0].left, s[1][0][0].left.x, "norm_b1");
        testAbs(s[0][1][0].right, s[1][0][0].right.x, "norm_b2");
        testAbs(s[5][1][5].left, s[1][0][5].left.x, "norm_b3");
        testAbs(s[5][1][5].right, s[1][0][5].right.x, "norm_b4");
        testAbs(s[0][1][1].left, s[0][0][1].left.x, "norm_b5");
        testAbs(s[0][1][1].right, s[0][0][1].right.x, "norm_b6");
    }
}
// import IntervalTree from '@flatten-js/interval-tree';
// function makeIntervalTreeForDirection(snowflake: Snowflake, direction: Direction): IntervalTree {
//   const tree = new IntervalTree();
//   return tree;
// }
var enableTests = true;
if (enableTests) {
    testFindCircleRayIntersection();
    testDelete();
    testRotatePoint();
    testGetFacePoints();
    testGetFaceSide2Ds();
    testGetNormalizedFaceSides();
    testGetBranchEndPoints();
}
