var canvas = document.getElementById('snowflake');
var ctx = canvas.getContext('2d');
var graphCanvas = document.getElementById('graph');
var graphCtx = graphCanvas.getContext('2d');
var pauseButton = document.getElementById('pause');
var resetButton = document.getElementById('reset');
var isPlaying = true;
pauseButton.addEventListener('click', function (e) {
    isPlaying = !isPlaying;
    if (isPlaying) {
        pauseButton.innerHTML = 'pause';
        canvas.className = '';
    }
    else {
        pauseButton.innerHTML = 'play';
        canvas.className = 'paused';
    }
});
resetButton.addEventListener('click', function (e) {
    reset();
});
var handleBeingDragged = undefined;
var mouseRecentlyExitedGraph = false;
var graphMouse = { x: 0, y: 0 };
graphCanvas.addEventListener('mousemove', function (e) {
    graphMouse.x = e.offsetX;
    graphMouse.y = e.offsetY;
});
graphCanvas.addEventListener('mousedown', function (e) {
    handleBeingDragged = 'needs lookup';
});
window.addEventListener('mouseup', function (e) {
    handleBeingDragged = undefined;
});
graphCanvas.addEventListener('mouseleave', function (e) {
    // handleBeingDragged = undefined;
    mouseRecentlyExitedGraph = true;
    //if (graphMouse.y > graphCanvas.height * 0.5) {
    //  graphMouse.y = graphCanvas.height;
    //} else {
    //  graphMouse.y = 0;
    //}
});
var lightBlue = 'rgba(90, 211, 255, 1.0)';
var graphBackground = 'rgba(90, 211, 255, 0.5)';
ctx.fillStyle = lightBlue;
var oneSixthCircle = Math.PI * 2 / 6;
var directions = [
    0 * oneSixthCircle,
    1 * oneSixthCircle,
    2 * oneSixthCircle,
    3 * oneSixthCircle,
    4 * oneSixthCircle,
    5 * oneSixthCircle,
];
function nextDirection(d) {
    return ((d + 1) % directions.length);
}
function previousDirection(d) {
    return rem(d - 1, directions.length);
}
function copyPoint(p) {
    return { x: p.x, y: p.y };
}
function branchEnd(branch) {
    var d = directions[branch.direction];
    var l = branch.length;
    var x = branch.start.x + l * Math.cos(d);
    var y = branch.start.y + l * Math.sin(d);
    return { x: x, y: y };
}
function drawSnowflake(snowflake) {
    snowflake.faces.forEach(drawFace);
    snowflake.branches.forEach(drawBranch);
}
function drawFace(face) {
    var center = toCanvasPoint(face.center);
    var size = toCanvasSize(face.size);
    ctx.beginPath();
    ctx.moveTo(center.x + size, center.y);
    for (var dir = 1; dir < 6; dir += 1) {
        var x = center.x + size * Math.cos(directions[dir]);
        var y = center.y - size * Math.sin(directions[dir]);
        ctx.lineTo(x, y);
    }
    ctx.closePath();
    //const oldStyle = ctx.fillStyle;
    //if (face.rayHits > 0) {
    //  ctx.fillStyle = otherStyle;
    //}
    ctx.fill();
    //ctx.fillStyle = oldStyle;
}
function rem(x, m) {
    return ((x % m) + m) % m;
}
function drawBranch(branch) {
    var startCenter = toCanvasPoint(branch.start);
    var endCenter = toCanvasPoint(branchEnd(branch));
    var size = toCanvasSize(branch.size);
    var dir = rem(branch.direction - 2, directions.length);
    ctx.beginPath();
    {
        var x = startCenter.x + size * Math.cos(directions[dir]);
        var y = startCenter.y - size * Math.sin(directions[dir]);
        ctx.moveTo(x, y);
    }
    for (var i = 0; i < 2; i += 1) {
        dir = rem(dir - 1, directions.length);
        var x = startCenter.x + size * Math.cos(directions[dir]);
        var y = startCenter.y - size * Math.sin(directions[dir]);
        ctx.lineTo(x, y);
    }
    for (var i = 0; i < 3; i += 1) {
        dir = rem(dir - 1, directions.length);
        var x = endCenter.x + size * Math.cos(directions[dir]);
        var y = endCenter.y - size * Math.sin(directions[dir]);
        ctx.lineTo(x, y);
    }
    ctx.closePath();
    //const oldStyle = ctx.fillStyle;
    //if (branch.rayHits > 0) {
    //  ctx.fillStyle = otherStyle;
    //}
    ctx.fill();
    //ctx.fillStyle = oldStyle;
    //ctx.beginPath();
    //ctx.strokeStyle = 'black';
    //const circles = createCirclesAlongBranch(branch);
    //for (let i = 0; i < circles.length; i += 1) {
    //  const circle = circles[i];
    //  const cCenter = toCanvasPoint(circle.center);
    //  const cRadius = toCanvasSize(circle.radius);
    //  ctx.ellipse(cCenter.x, cCenter.y, cRadius, cRadius, 0, 2 * Math.PI, 0);
    //}
    //ctx.closePath();
    //ctx.stroke();
}
function toCanvasSize(n) {
    var smallestDimension = Math.min(canvas.width, canvas.height);
    return n * smallestDimension;
}
function toCanvasPoint(p) {
    var result = { x: p.x, y: p.y };
    result.x *= canvas.width / 2;
    result.y *= -canvas.height / 2;
    result.x += canvas.width * 0.5;
    result.y += canvas.height * 0.5;
    return result;
}
function createInitialSnowflake() {
    return {
        faces: [{
                rayHits: 0,
                growing: true,
                center: { x: 0, y: 0 },
                size: 0.0025,
                direction: 'none',
                growthScale: 1
            }],
        branches: []
    };
}
var growthScalar = 0.0001;
var branchGrowthScalar = growthScalar * 0.3;
function enlargeGrowingFaces(snowflake, scale) {
    snowflake.faces.forEach(function (face) {
        if (face.growing) {
            face.size += 0.75 * scale * growthScalar * face.growthScale;
            if (face.direction !== 'none') {
                var dx = 0.75 * 2 * scale * growthScalar * Math.cos(directions[face.direction]) * face.growthScale;
                var dy = 0.75 * 2 * scale * growthScalar * Math.sin(directions[face.direction]) * face.growthScale;
                face.center.x += dx;
                face.center.y += dy;
            }
        }
    });
}
function enlargeGrowingBranches(snowflake, scale) {
    snowflake.branches.forEach(function (branch) {
        if (branch.growing) {
            //const rayHitScale = (() => {
            //  if (branch.rayHits > 10) {
            //    return 2;
            //  }
            //  if (branch.rayHits > 5) {
            //    return 1;
            //  }
            //  if (branch.rayHits)
            //})();
            var lengthScalar = -1.5 * scale + 1.5;
            var sizeScalar = 1.5 * scale;
            branch.size += sizeScalar * branchGrowthScalar * branch.growthScale;
            branch.length += lengthScalar * growthScalar * branch.growthScale;
        }
    });
}
function addBranchesToGrowingFaces(snowflake) {
    snowflake.faces.forEach(function (face) {
        if (face.growing) {
            face.growing = false;
            addBranchesToFace(snowflake, face);
        }
    });
}
function addFacesToGrowingBranches(snowflake) {
    snowflake.branches.forEach(function (branch) {
        if (branch.growing) {
            branch.growing = false;
            addFaceToBranch(snowflake, branch);
        }
    });
}
function addBranchesToFace(snowflake, face) {
    var initialFraction = 0.01;
    var sizeOfNewBranches = face.size * initialFraction;
    var distFromCenter = 2 * face.size * (1 - initialFraction);
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
            return face.growthScale * 0.5;
        })();
        snowflake.branches.push({
            rayHits: 0,
            growing: true,
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
    snowflake.faces.push({
        rayHits: 0,
        growing: true,
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
    var oldFillStyle = graphCtx.fillStyle;
    var oldStrokeStyle = graphCtx.strokeStyle;
    var oldLineDash = graphCtx.getLineDash();
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
    graphCtx.beginPath();
    graphCtx.arc(x, y, 3, 0, 2 * Math.PI);
    graphCtx.closePath();
    graphCtx.fillStyle = newStyle;
    graphCtx.fill();
    graphCtx.closePath();
    graphCtx.beginPath();
    graphCtx.arc(x, y, outerRingRadius, 0, 2 * Math.PI);
    graphCtx.strokeStyle = newStyle;
    graphCtx.setLineDash(newLineDash);
    graphCtx.stroke();
    graphCtx.fillStyle = oldFillStyle;
    graphCtx.strokeStyle = oldStrokeStyle;
    graphCtx.setLineDash(oldLineDash);
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
var writableGraphWidth = graphCanvas.width - 2 * graphMargin;
var writableGraphHeight = graphCanvas.height;
function drawGrowthInput() {
    var dx = writableGraphWidth / (growthInput.length - 1);
    var dy = writableGraphHeight / yChoices.length;
    var percentDone = step / maxSteps;
    var old = graphCtx.fillStyle;
    graphCtx.fillStyle = graphBackground;
    graphCtx.fillRect(graphMargin, 0, writableGraphWidth * percentDone, writableGraphHeight);
    graphCtx.fillStyle = old;
    graphCtx.beginPath();
    {
        var p = growthHandlePosition(0);
        graphCtx.moveTo(p.x, p.y);
    }
    for (var i = 1; i < growthInput.length; i += 1) {
        var p = growthHandlePosition(i);
        graphCtx.lineTo(p.x, p.y);
    }
    graphCtx.strokeStyle = 'black';
    graphCtx.stroke();
    var nearest = nearestGrowthHandle(graphMouse);
    for (var i = 0; i < growthInput.length; i += 1) {
        var p = growthHandlePosition(i);
        drawGraphHandle(p.x, p.y, i === nearest, i === handleBeingDragged);
    }
    graphCtx.beginPath();
    var progressX = writableGraphWidth * percentDone + graphMargin;
    graphCtx.moveTo(progressX, 0);
    graphCtx.lineTo(progressX, writableGraphHeight);
    graphCtx.strokeStyle = 'blue';
    graphCtx.stroke();
    graphCtx.beginPath();
    var xAxisY = writableGraphHeight * 0.5;
    graphCtx.moveTo(graphMargin, xAxisY);
    graphCtx.lineTo(writableGraphWidth + graphMargin, xAxisY);
    graphCtx.strokeStyle = 'black';
    graphCtx.setLineDash([2, 2]);
    graphCtx.stroke();
    graphCtx.setLineDash([]);
    //const facetingMetrics = graphCtx.measureText("faceting");
    //const branchingMetrics = graphCtx.measureText("branching");
    //graphCtx.fillText(
    //  "faceting",
    //  writableGraphWidth - facetingMetrics.width,
    //  writableGraphHeight * 0.5 - facetingMetrics.actualBoundingBoxAscent,
    //);
    //graphCtx.fillText(
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
function darken(snowflake) {
    var newBranches = [];
    var newFaces = [];
    for (var i = 0; i < snowflake.branches.length; i += 1) {
        var branch = snowflake.branches[i];
        if (branch.growing) {
            newBranches.push({
                growing: false,
                start: { x: branch.start.x, y: branch.start.y },
                size: branch.size,
                length: branch.length,
                direction: branch.direction
            });
        }
    }
    for (var i = 0; i < snowflake.faces.length; i += 1) {
        var face = snowflake.faces[i];
        if (face.growing) {
            newFaces.push({
                growing: false,
                center: { x: face.center.x, y: face.center.y },
                size: face.size,
                direction: face.direction
            });
        }
    }
    for (var i = 0; i < newBranches.length; i += 1) {
        snowflake.branches.push(newBranches[i]);
    }
    for (var i = 0; i < newFaces.length; i += 1) {
        snowflake.faces.push(newFaces[i]);
    }
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
    var start = toCanvasPoint(ray.start);
    var end = toCanvasPoint({ x: 0, y: 0 });
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.closePath();
    ctx.stroke();
}
function castRaysAtGrowingParts(snowflake) {
    for (var i = 0; i < snowflake.faces.length; i += 1) {
        var face = snowflake.faces[i];
        face.rayHits = 0;
    }
    for (var i = 0; i < snowflake.branches.length; i += 1) {
        var branch = snowflake.branches[i];
        branch.rayHits = 0;
    }
    var numRays = 200;
    var theta = Math.PI * 2 / numRays;
    for (var i = 0; i < numRays; i += 1) {
        var ray = buildRay(theta * i);
        //drawRay(ray);
        var intersection = firstRayIntersection(snowflake, ray);
        if (intersection !== undefined) {
            intersection.rayHits += 1;
        }
    }
    for (var i = 0; i < snowflake.faces.length; i += 1) {
        var face = snowflake.faces[i];
        if (face.rayHits === 0) {
            face.growing = false;
        }
    }
    for (var i = 0; i < snowflake.branches.length; i += 1) {
        var branch = snowflake.branches[i];
        if (branch.rayHits === 0) {
            branch.growing = false;
        }
    }
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
    for (var i = 0; i < snowflake.faces.length; i += 1) {
        var face = snowflake.faces[i];
        var circle = {
            center: copyPoint(face.center),
            radius: face.size
        };
        if (face.growing) {
            circle.radius = Math.max(circle.radius, 0.01);
            var intersection = findCircleRayIntersection(circle, ray);
            updateIntersection(intersection, face, ray);
        }
    }
    for (var i = 0; i < snowflake.branches.length; i += 1) {
        var branch = snowflake.branches[i];
        if (branch.growing) {
            var circles = createCirclesAlongBranch(branch);
            for (var c = 0; c < circles.length; c += 1) {
                var circle = circles[c];
                var intersection = findCircleRayIntersection(circle, ray);
                updateIntersection(intersection, branch, ray);
            }
        }
    }
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
    var radius = (function () {
        if (branch.growing) {
            return Math.max(branch.size, 0.01);
        }
        return branch.size;
    })();
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
function reset() {
    snowflake = createInitialSnowflake();
    step = 0;
    currentGrowthType = undefined;
    clearSnowflakeCanvas();
}
function currentTime() {
    return step / maxSteps;
}
function updateGraph() {
    if (handleBeingDragged !== undefined || mouseRecentlyExitedGraph) {
        mouseRecentlyExitedGraph = false;
        var handle = (function () {
            if (handleBeingDragged === 'needs lookup') {
                return nearestGrowthHandle(graphMouse);
            }
            else {
                return handleBeingDragged;
            }
        })();
        if (handleBeingDragged === 'needs lookup') {
            handleBeingDragged = handle;
        }
        var dy = writableGraphHeight / yChoices.length;
        var i = Math.floor(graphMouse.y / dy);
        growthInput[handle] = clamp(i, 0, yChoices.length - 1);
        //while (growthInput[handle] > 0 && growthHandlePosition(handle).y > graphMouse.y) {
        //  growthInput[handle] -= 1;
        //}
        //while (growthInput[handle] < yChoices.length && growthHandlePosition(handle).y < graphMouse.y) {
        //  growthInput[handle] += 1;
        //}
    }
}
function update() {
    if (step < maxSteps && isPlaying) {
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
    graphCtx.clearRect(0, 0, graphCanvas.width, graphCanvas.height);
    drawGrowthInput();
}
function clearSnowflakeCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
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
function testBranchEnd() {
    var r1 = branchEnd({
        rayHits: 0,
        growing: true,
        start: { x: 0, y: 0 },
        size: 0.1,
        length: 1,
        direction: 0,
        growthScale: 1
    });
    test(Math.abs(r1.x - 1) < 0.0001, 'testBranchEnd1');
    test(Math.abs(r1.y - 0) < 0.0001, 'testBranchEnd2');
}
// function testRayIntersectsCircle() {
//   test(
//     rayIntersectsCircle(
//       buildRay(0),
//       { center: { x: 0, y: 0}, radius: 1 },
//     ),
//     'rayIntersectsCircle1',
//   );
//   test(
//     !rayIntersectsCircle(
//       buildRay(0),
//       { center: { x: 0, y: 3 }, radius: 1 },
//     ),
//     'rayIntersectsCircle2',
//   );
// }
//testBranchEnd();
// testRayIntersectsCircle();
