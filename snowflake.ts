const canvas = document.getElementById('canvas') as HTMLCanvasElement ;
const ctx = canvas.getContext('2d');

ctx.fillStyle = 'white';

type Angle = number;
type Point = { x: number, y: number };

const SPLIT: Angle = Math.PI * 2 / 6;

function point(x: number, y: number): Point {
  return {
    x: x,
    y: y,
  }
}

type Vertex = {
  position: Point,
  direction: Angle,
  children: Array<Vertex>,
};

function vertex(position: Point, direction: Angle): Vertex {
  return {
    position,
    direction,
    children: [],
  };
}

function advanceVertex(vertex: Vertex, amount: number) {
  let x = vertex.position.x;
  let y = vertex.position.y;

  let xp = x + Math.cos(vertex.direction) * amount;
  let yp = y + Math.sin(vertex.direction) * amount;

  let oldDistFromOrigin = Math.sqrt(x * x + y * y);
  let newDistFromOrigin = Math.sqrt(xp * xp + yp * yp);

  let diffDist = newDistFromOrigin - oldDistFromOrigin;

  if (diffDist > 0) {
    vertex.position.x = xp;
    vertex.position.y = yp;
  } else {
  }
}

function snowflake(): Vertex {
  return vertex(point(0, 0), 0);
}

function isEndpoint(v: Vertex): boolean {
  return v.children.length === 0;
}

function endpoints(snowflake: Vertex): Array<Vertex> {
  const vs = [];
  const todo = [snowflake];

  while (todo.length > 0) {
    const v = todo.pop();
    if (isEndpoint(v)) {
      vs.push(v);
    } else {
      v.children.forEach(c => todo.push(c));
    }
  }

  return vs;
}

function splitEndpoints(snowflake: Vertex) {
  const es = endpoints(snowflake);
  es.forEach(endpoint => {
    let direction = endpoint.direction;
    for (let i = 0; i < 6; i += 1) {
      endpoint.children.push(
        vertex(
          point(endpoint.position.x, endpoint.position.y),
          direction
        ));
      direction += SPLIT;
    }
  });
}

function growEndpoints(snowflake: Vertex, amount: number) {
  const es = endpoints(snowflake);
  es.forEach(endpoint => advanceVertex(endpoint, amount));
}

function toCanvasPoint(p: Point): Point {
  const result = point(p.x, p.y);

  result.x *= canvas.width;
  result.y *= canvas.height;

  result.x += canvas.width * 0.5;
  result.y += canvas.height * 0.5;

  return result;
}

function drawSnowflake(snowflake: Vertex) {
  const todo = [snowflake];
  while (todo.length > 0) {
    const v = todo.pop();
    drawVertex(v);
    v.children.forEach(c => todo.push(c));
  }
}

function drawVertex(v: Vertex) {
  ctx.fillStyle = 'white';
  ctx.strokeStyle = 'white';
  
  const p = toCanvasPoint(v.position);

  v.children.forEach(child => {
    let c = toCanvasPoint(child.position);

    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(c.x, c.y);
    ctx.closePath();
    ctx.stroke();
  });
}

ctx.globalAlpha = 0.15;

const splitChance = 0.0025;
const growAmount = 0.0005;
const interval = 1.6e-5;
const maxSteps = 1000;

let steps = 0;

const s = snowflake();
splitEndpoints(s);

let toClear;

function update() {
  if (steps < maxSteps) {
    if (Math.floor(Math.random() / splitChance) === 0) {
      splitEndpoints(s);
    }
    growEndpoints(s, growAmount);
    drawSnowflake(s);

    steps += 1;
  } else {
    window.clearInterval(toClear);
  }
}

toClear = window.setInterval(update, interval);
