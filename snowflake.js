var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
ctx.fillStyle = 'white';
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
function clamp(x, low, high) {
    return Math.min(Math.max(x, low), high);
}
function test(cond, name) {
    if (!cond) {
        console.error("Test failure: ".concat(name));
    }
    else {
        console.log("Test success: ".concat(name));
    }
}
function buildGrowthFunction(growthInput) {
    return function (t) {
        var s = clamp(t, 0, 1) * growthInput.length;
        var x = Math.floor(s);
        var i = x === growthInput.length ? growthInput.length - 1 : x;
        var signedScale = growthInput[i];
        return {
            scale: Math.abs(signedScale),
            growthType: signedScale > 0.0 ? 'branching' : 'faceting'
        };
    };
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
function enlargeGrowingFaces(snowflake) {
    snowflake.faces.forEach(function (face) {
        if (face.growing) {
            face.size += growthScalar;
            if (face.direction !== 'none') {
                var dx = 2 * growthScalar * Math.cos(directions[face.direction]);
                var dy = 2 * growthScalar * Math.sin(directions[face.direction]);
                face.center.x += dx;
                face.center.y += dy;
            }
        }
    });
}
function enlargeGrowingBranches(snowflake) {
    snowflake.branches.forEach(function (branch) {
        if (branch.growing) {
            branch.size += branchGrowthScalar;
            branch.length += growthScalar;
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
var updateInterval = 10;
var snowflake = createInitialSnowflake();
var step = 0;
var faces = true;
var intervalId = undefined;
function update() {
    step += 1;
    if (faces) {
        enlargeGrowingFaces(snowflake);
    }
    else {
        enlargeGrowingBranches(snowflake);
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawSnowflake(snowflake);
    if (step % 700 === 0) {
        if (faces) {
            addBranchesToGrowingFaces(snowflake);
        }
        else {
            addFacesToGrowingBranches(snowflake);
        }
        faces = !faces;
    }
    if (step === 6000) {
        window.clearInterval(intervalId);
        console.log('done growing');
    }
}
intervalId = window.setInterval(update, updateInterval);
function testBuildGrowthFunction() {
    test(buildGrowthFunction([-1, 0.5, 0])(0.0).scale === 1, 'buildGrowthFunction1');
    test(buildGrowthFunction([-1, 0.5, 0])(0.32).scale === 1, 'buildGrowthFunction2');
    test(buildGrowthFunction([-1, 0.5, 0])(0.34).scale === 0.5, 'buildGrowthFunction3');
    test(buildGrowthFunction([-1, 0.5, 0])(0.65).scale === 0.5, 'buildGrowthFunction4');
    test(buildGrowthFunction([-1, 0.5, 0])(0.67).scale === 0.0, 'buildGrowthFunction5');
    test(buildGrowthFunction([-1, 0.5, 0])(1).scale === 0.0, 'buildGrowthFunction6');
    test(buildGrowthFunction([-1, 0.5, 0])(100).scale === 0.0, 'buildGrowthFunction7');
    test(buildGrowthFunction([-1, 0.5, 0])(-100).scale === 1, 'buildGrowthFunction8');
    test(buildGrowthFunction([-1, 0.5, 0])(0.0).growthType === 'faceting', 'buildGrowthFunction9');
    test(buildGrowthFunction([-1, 0.5, 0])(0.32).growthType === 'faceting', 'buildGrowthFunction10');
    test(buildGrowthFunction([-1, 0.5, 0])(0.34).growthType === 'branching', 'buildGrowthFunction11');
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
testBuildGrowthFunction();
testBranchEnd();
// const canvas = document.getElementById('canvas') as HTMLCanvasElement ;
// const ctx = canvas.getContext('2d');
// 
// ctx.fillStyle = 'white';
// 
// type Angle = number;
// type Point = { x: number, y: number };
// 
// const SPLIT: Angle = Math.PI * 2 / 6;
// 
// function point(x: number, y: number): Point {
//   return {
//     x: x,
//     y: y,
//   }
// }
// 
// type Vertex = {
//   position: Point,
//   direction: Angle,
//   children: Array<Vertex>,
// };
// 
// function vertex(position: Point, direction: Angle): Vertex {
//   return {
//     position,
//     direction,
//     children: [],
//   };
// }
// 
// function advanceVertex(vertex: Vertex, amount: number) {
//   let x = vertex.position.x;
//   let y = vertex.position.y;
// 
//   let xp = x + Math.cos(vertex.direction) * amount;
//   let yp = y + Math.sin(vertex.direction) * amount;
// 
//   let oldDistFromOrigin = Math.sqrt(x * x + y * y);
//   let newDistFromOrigin = Math.sqrt(xp * xp + yp * yp);
// 
//   let diffDist = newDistFromOrigin - oldDistFromOrigin;
// 
//   if (diffDist > 0) {
//     vertex.position.x = xp;
//     vertex.position.y = yp;
//   } else {
//   }
// }
// 
// function snowflake(): Vertex {
//   return vertex(point(0, 0), 0);
// }
// 
// function isEndpoint(v: Vertex): boolean {
//   return v.children.length === 0;
// }
// 
// function endpoints(snowflake: Vertex): Array<Vertex> {
//   const vs = [];
//   const todo = [snowflake];
// 
//   while (todo.length > 0) {
//     const v = todo.pop();
//     if (isEndpoint(v)) {
//       vs.push(v);
//     } else {
//       v.children.forEach(c => todo.push(c));
//     }
//   }
// 
//   return vs;
// }
// 
// function splitEndpoints(snowflake: Vertex) {
//   const es = endpoints(snowflake);
//   es.forEach(endpoint => {
//     let direction = endpoint.direction;
//     for (let i = 0; i < 6; i += 1) {
//       endpoint.children.push(
//         vertex(
//           point(endpoint.position.x, endpoint.position.y),
//           direction
//         ));
//       direction += SPLIT;
//     }
//   });
// }
// 
// function growEndpoints(snowflake: Vertex, amount: number) {
//   const es = endpoints(snowflake);
//   es.forEach(endpoint => advanceVertex(endpoint, amount));
// }
// 
// function toCanvasPoint(p: Point): Point {
//   const result = point(p.x, p.y);
// 
//   result.x *= canvas.width;
//   result.y *= canvas.height;
// 
//   result.x += canvas.width * 0.5;
//   result.y += canvas.height * 0.5;
// 
//   return result;
// }
// 
// function drawSnowflake(snowflake: Vertex) {
//   const todo = [snowflake];
//   while (todo.length > 0) {
//     const v = todo.pop();
//     drawVertex(v);
//     v.children.forEach(c => todo.push(c));
//   }
// }
// 
// function drawVertex(v: Vertex) {
//   ctx.fillStyle = 'white';
//   ctx.strokeStyle = 'white';
//   
//   const p = toCanvasPoint(v.position);
// 
//   v.children.forEach(child => {
//     let c = toCanvasPoint(child.position);
// 
//     ctx.beginPath();
//     ctx.moveTo(p.x, p.y);
//     ctx.lineTo(c.x, c.y);
//     ctx.closePath();
//     ctx.stroke();
//   });
// }
// 
// ctx.globalAlpha = 0.15;
// 
// const splitChance = 0.0025;
// const growAmount = 0.0005;
// const interval = 1.6e-5;
// const maxSteps = 1000;
// 
// let steps = 0;
// 
// const s = snowflake();
// splitEndpoints(s);
// 
// let toClear;
// 
// function update() {
//   if (steps < maxSteps) {
//     if (Math.floor(Math.random() / splitChance) === 0) {
//       splitEndpoints(s);
//     }
//     growEndpoints(s, growAmount);
//     drawSnowflake(s);
// 
//     steps += 1;
//   } else {
//     window.clearInterval(toClear);
//   }
// }
// 
// toClear = window.setInterval(update, interval);
