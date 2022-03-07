var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var graphCanvas = document.getElementById('graph');
var graphCtx = graphCanvas.getContext('2d');
ctx.fillStyle = 'rgba(90, 211, 255, 0.3)';
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
    ctx.fill();
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
    ctx.fill();
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
                growing: true,
                center: { x: 0, y: 0 },
                size: 0.0025,
                direction: 'none'
            }],
        branches: []
    };
}
var growthScalar = 0.0001;
var branchGrowthScalar = growthScalar * 0.3;
function enlargeGrowingFaces(snowflake, scale) {
    snowflake.faces.forEach(function (face) {
        if (face.growing) {
            face.size += scale * growthScalar;
            if (face.direction !== 'none') {
                var dx = 2 * scale * growthScalar * Math.cos(directions[face.direction]);
                var dy = 2 * scale * growthScalar * Math.sin(directions[face.direction]);
                face.center.x += dx;
                face.center.y += dy;
            }
        }
    });
}
function enlargeGrowingBranches(snowflake, scale) {
    snowflake.branches.forEach(function (branch) {
        if (branch.growing) {
            branch.size += scale * branchGrowthScalar;
            branch.length += scale * growthScalar;
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
    for (var dir = 0; dir < directions.length; dir += 1) {
        var x = cx + distFromCenter * Math.cos(directions[dir]);
        var y = cy + distFromCenter * Math.sin(directions[dir]);
        snowflake.branches.push({
            growing: true,
            start: { x: x, y: y },
            size: sizeOfNewBranches,
            length: 0,
            direction: dir
        });
    }
}
function addFaceToBranch(snowflake, branch) {
    snowflake.faces.push({
        growing: true,
        center: branchEnd(branch),
        size: branch.size,
        direction: branch.direction
    });
}
function clamp(x, low, high) {
    return Math.min(Math.max(x, low), high);
}
//function buildGrowthFunction(growthInput: NonEmptyArray<number>): GrowthFunction {
//  return t => {
//    let s = clamp(t, 0, 1) * growthInput.length;
//    let x = Math.floor(s);
//    let i = x === growthInput.length ? growthInput.length - 1 : x;
//    let signedScale = growthInput[i];
//    return {
//      scale: Math.abs(signedScale),
//      growthType: signedScale > 0.0 ? 'branching' : 'faceting',
//    };
//  };
//}
var growthInput = [-1, 1.0, -0.5, 0.5, -0.25, 1, -1];
function interpretGrowth(time) {
    var s = clamp(time, 0, 1) * growthInput.length;
    var x = Math.floor(s);
    var i = x === growthInput.length ? growthInput.length - 1 : x;
    var signedScale = growthInput[i];
    return {
        scale: Math.abs(signedScale),
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
var updateInterval = 5;
var maxSteps = 6000;
var snowflake = createInitialSnowflake();
var step = 0;
var intervalId = undefined;
var currentGrowthType = undefined;
function currentTime() {
    return step / maxSteps;
}
function update() {
    step += 1;
    if (step % 100 === 0) {
        darken(snowflake);
    }
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
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawSnowflake(snowflake);
    if (step === maxSteps) {
        window.clearInterval(intervalId);
        console.log('done growing');
    }
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
        growing: true,
        start: { x: 0, y: 0 },
        size: 0.1,
        length: 1,
        direction: 0
    });
    test(Math.abs(r1.x - 1) < 0.0001, 'testBranchEnd1');
    test(Math.abs(r1.y - 0) < 0.0001, 'testBranchEnd2');
}
testBranchEnd();
