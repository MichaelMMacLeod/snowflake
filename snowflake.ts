const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d');

ctx.fillStyle = 'white';

const oneSixthCircle = Math.PI * 2 / 6;

const directions = [
  0 * oneSixthCircle,
  1 * oneSixthCircle,
  2 * oneSixthCircle,
  3 * oneSixthCircle,
  4 * oneSixthCircle,
  5 * oneSixthCircle,
];

type Direction = 0 | 1 | 2 | 3 | 4 | 5;

type Point = { x: number, y: number };

type Snowflake = {
  faces: Array<Face>,
  branches: Array<Branch>,
};

type Face = {
  growing: boolean,
  center: Point,
  size: number,
};

type Branch = {
  growing: boolean,
  start: Point,
  size: number,
  length: number,
  direction: Direction,
}

function branchEnd(branch: Branch): Point {
  let d = directions[branch.direction];
  let l = branch.length;
  let x = branch.start.x + l * Math.cos(d);
  let y = branch.start.y + l * Math.sin(d);
  return { x, y };
}

type GrowthFunction = (time: number) => Growth;

type Growth = { scale: number, growthType: GrowthType };

type GrowthType = 'branching' | 'faceting';

function clamp(x: number, low: number, high: number): number {
  return Math.min(Math.max(x, low), high);
}

type NonEmptyArray<T> = { 0: T } & Array<T>;

function test(cond: boolean, name: string): void {
  if (!cond) {
    console.error(`Test failure: ${name}`);
  } else {
    console.log(`Test success: ${name}`);
  }
}

function buildGrowthFunction(growthInput: NonEmptyArray<number>): GrowthFunction {
  return t => {
    let s = clamp(t, 0, 1) * growthInput.length;
    let x = Math.floor(s);
    let i = x === growthInput.length ? growthInput.length - 1 : x;
    let signedScale = growthInput[i];
    return {
      scale: Math.abs(signedScale),
      growthType: signedScale > 0.0 ? 'branching' : 'faceting',
    };
  };
}

function drawSnowflake(snowflake: Snowflake): void {
  snowflake.faces.forEach(drawFace);
  snowflake.branches.forEach(drawBranch);
}

function drawFace(face: Face): void {
  const center = toCanvasPoint(face.center);
  const size = toCanvasSize(face.size);
  ctx.beginPath();
  ctx.moveTo(center.x + size, center.y);
  for (let dir: Direction = 1; dir < 6; dir += 1) {
    const x = center.x + size * Math.cos(directions[dir]);
    const y = center.y - size * Math.sin(directions[dir]);
    ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}

function rem(x: number, m: number): number {
  return ((x % m) + m) % m;
}

function drawBranch(branch: Branch): void {
  const startCenter = toCanvasPoint(branch.start);
  const endCenter = toCanvasPoint(branchEnd(branch));
  const size = toCanvasSize(branch.size);
  let dir = rem(branch.direction - 2, directions.length);
  ctx.beginPath();
  {
    const x = startCenter.x + size * Math.cos(directions[dir]);
    const y = startCenter.y - size * Math.sin(directions[dir]);
    ctx.moveTo(x, y);
  }
  for (let i = 0; i < 2; i += 1) {
    dir = rem(dir - 1, directions.length);
    const x = startCenter.x + size * Math.cos(directions[dir]);
    const y = startCenter.y - size * Math.sin(directions[dir]);
    ctx.lineTo(x, y);
  }
  for (let i = 0; i < 3; i += 1) {
    dir = rem(dir - 1, directions.length);
    const x = endCenter.x + size * Math.cos(directions[dir]);
    const y = endCenter.y - size * Math.sin(directions[dir]);
    ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}

function toCanvasSize(n: number): number {
  const smallestDimension = Math.min(canvas.width, canvas.height);
  return n * smallestDimension;
}

function toCanvasPoint(p: Point): Point {
  const result = { x: p.x, y: p.y };

  result.x *= canvas.width / 2;
  result.y *= -canvas.height / 2;

  result.x += canvas.width * 0.5;
  result.y += canvas.height * 0.5;

  return result;
}

function createInitialSnowflake(): Snowflake {
  return {
    faces: [{
      growing: true,
      center: { x: 0, y: 0 },
      size: 0.0025,
    }],
    branches: [],
  };
}

function enlargeGrowingFaces(snowflake: Snowflake): void {
  snowflake.faces.forEach(face => {
    if (face.growing) {
      face.size += 0.00005;
    }
  })
}

//function addBranchesToGrowingFaces(snowflake: Snowflake): void {
//  snowflake.forEach(flakePart => {
//    if (!flakePart.growing) {
//      return;
//    }
//
//
//  })
//}

const updateInterval = 1.6e-5;
let snowflake = createInitialSnowflake();

function update() {
  enlargeGrowingFaces(snowflake);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawSnowflake(snowflake);
}

window.setInterval(update, updateInterval);

//drawBranch({
//  start: { x: 0.5, y: -0.5 },
//  size: 0.1,
//  length: 0.3,
//});

function testBuildGrowthFunction(): void {
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

function testBranchEnd(): void {
  let r1 = branchEnd({
    growing: true,
    start: { x: 0, y: 0 },
    size: 0.1,
    length: 1,
    direction: 0,
  });
  test(
    Math.abs(r1.x - 1) < 0.0001,
    'testBranchEnd1',
  );
  test(
    Math.abs(r1.y - 0) < 0.0001,
    'testBranchEnd2',
  );
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
