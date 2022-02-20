var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
ctx.fillStyle = 'white';
var SPLIT = Math.PI * 2 / 6;
function point(x, y) {
    return {
        x: x,
        y: y
    };
}
function vertex(position, direction) {
    return {
        position: position,
        direction: direction,
        children: []
    };
}
function advanceVertex(vertex, amount) {
    var x = vertex.position.x;
    var y = vertex.position.y;
    var xp = x + Math.cos(vertex.direction) * amount;
    var yp = y + Math.sin(vertex.direction) * amount;
    var oldDistFromOrigin = Math.sqrt(x * x + y * y);
    var newDistFromOrigin = Math.sqrt(xp * xp + yp * yp);
    var diffDist = newDistFromOrigin - oldDistFromOrigin;
    if (diffDist > 0) {
        vertex.position.x = xp;
        vertex.position.y = yp;
    }
    else {
    }
}
function snowflake() {
    return vertex(point(0, 0), 0);
}
function isEndpoint(v) {
    return v.children.length === 0;
}
function endpoints(snowflake) {
    var vs = [];
    var todo = [snowflake];
    while (todo.length > 0) {
        var v = todo.pop();
        if (isEndpoint(v)) {
            vs.push(v);
        }
        else {
            v.children.forEach(function (c) { return todo.push(c); });
        }
    }
    return vs;
}
function splitEndpoints(snowflake) {
    var es = endpoints(snowflake);
    es.forEach(function (endpoint) {
        var direction = endpoint.direction;
        for (var i = 0; i < 6; i += 1) {
            endpoint.children.push(vertex(point(endpoint.position.x, endpoint.position.y), direction));
            direction += SPLIT;
        }
    });
}
function growEndpoints(snowflake, amount) {
    var es = endpoints(snowflake);
    es.forEach(function (endpoint) { return advanceVertex(endpoint, amount); });
}
function toCanvasPoint(p) {
    var result = point(p.x, p.y);
    result.x *= canvas.width;
    result.y *= canvas.height;
    result.x += canvas.width * 0.5;
    result.y += canvas.height * 0.5;
    return result;
}
function drawSnowflake(snowflake) {
    var todo = [snowflake];
    while (todo.length > 0) {
        var v = todo.pop();
        drawVertex(v);
        v.children.forEach(function (c) { return todo.push(c); });
    }
}
function drawVertex(v) {
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'white';
    var p = toCanvasPoint(v.position);
    v.children.forEach(function (child) {
        var c = toCanvasPoint(child.position);
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(c.x, c.y);
        ctx.closePath();
        ctx.stroke();
    });
}
ctx.globalAlpha = 0.15;
var splitChance = 0.0025;
var growAmount = 0.0005;
var interval = 1.6e-5;
var maxSteps = 1000;
var steps = 0;
var s = snowflake();
splitEndpoints(s);
var toClear;
function update() {
    if (steps < maxSteps) {
        if (Math.floor(Math.random() / splitChance) === 0) {
            splitEndpoints(s);
        }
        growEndpoints(s, growAmount);
        drawSnowflake(s);
        steps += 1;
    }
    else {
        window.clearInterval(toClear);
    }
}
toClear = window.setInterval(update, interval);
