const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d');
const graphCanvas = document.getElementById('graph') as HTMLCanvasElement;
const graphCtx = graphCanvas.getContext('2d');

ctx.fillStyle = 'rgba(90, 211, 255, 0.8)';

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

function nextDirection(d: Direction): Direction {
  return ((d + 1) % directions.length) as Direction;
}

function previousDirection(d: Direction): Direction {
  return rem(d - 1, directions.length) as Direction;
}

type Point = { x: number, y: number };

function copyPoint(p: Point): Point {
  return { x: p.x, y: p.y };
}

type Snowflake = {
  faces: Array<Face>,
  branches: Array<Branch>,
};

type Face = {
  rayHits: number,
  growing: boolean,
  center: Point,
  size: number,
  direction: Direction | 'none',
};

type Branch = {
  rayHits: number,
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
      rayHits: 0,
      growing: true,
      center: { x: 0, y: 0 },
      size: 0.0025,
      direction: 'none',
    }],
    branches: [],
  };
}

const growthScalar = 0.0001;
const branchGrowthScalar = growthScalar * 0.3;

function enlargeGrowingFaces(snowflake: Snowflake, scale: number): void {
  snowflake.faces.forEach(face => {
    if (face.growing) {
      face.size += scale * growthScalar;
      if (face.direction !== 'none') {
        const dx = 2 * scale * growthScalar * Math.cos(directions[face.direction]);
        const dy = 2 * scale * growthScalar * Math.sin(directions[face.direction]);
        face.center.x += dx;
        face.center.y += dy;
      }
    }
  })
}

function enlargeGrowingBranches(snowflake: Snowflake, scale: number): void {
  snowflake.branches.forEach(branch => {
    if (branch.growing) {
      branch.size += scale * branchGrowthScalar;
      branch.length += scale * growthScalar;
    }
  })
}

function addBranchesToGrowingFaces(snowflake: Snowflake): void {
  snowflake.faces.forEach(face => {
    if (face.growing) {
      face.growing = false;
      addBranchesToFace(snowflake, face);
    }
  })
}

function addFacesToGrowingBranches(snowflake: Snowflake): void {
  snowflake.branches.forEach(branch => {
    if (branch.growing) {
      branch.growing = false;
      addFaceToBranch(snowflake, branch);
    }
  })
}

function addBranchesToFace(snowflake: Snowflake, face: Face): void {
  const initialFraction = 0.01;
  const sizeOfNewBranches = face.size * initialFraction;
  const distFromCenter = 2 * face.size * (1 - initialFraction);
  const cx = face.center.x;
  const cy = face.center.y;

  let [startDir, numDirs]: [Direction, number] = (() => {
    if (face.direction === 'none') {
      return [0, 6];
    }

    return [
      previousDirection(face.direction),
      3,
    ];
  })();

  let dir = startDir;
  for (let i = 0; i < numDirs; i += 1) {
    const x = cx + distFromCenter * Math.cos(directions[dir]);
    const y = cy + distFromCenter * Math.sin(directions[dir]);
    snowflake.branches.push({
      rayHits: 0,
      growing: true,
      start: { x, y },
      size: sizeOfNewBranches,
      length: 0,
      direction: dir as Direction,
    });
    dir = nextDirection(dir);
  }
}

function addFaceToBranch(snowflake: Snowflake, branch: Branch): void {
  snowflake.faces.push({
    rayHits: 0,
    growing: true,
    center: branchEnd(branch),
    size: branch.size,
    direction: branch.direction,
  });
}


type NonEmptyArray<T> = { 0: T } & Array<T>;
type GrowthFunction = (time: number) => Growth;
type Growth = { scale: number, growthType: GrowthType };
type GrowthType = 'branching' | 'faceting';

function clamp(x: number, low: number, high: number): number {
  return Math.min(Math.max(x, low), high);
}

let growthInput: NonEmptyArray<number> = [-1, 1.0, 1.0, 1.0, -0.1, 0.1, -0.1, -0.5, 0.5, -0.25, 1, -1];

function interpretGrowth(time: number): Growth {
  let s = clamp(time, 0, 1) * growthInput.length;
  let x = Math.floor(s);
  let i = x === growthInput.length ? growthInput.length - 1 : x;
  let signedScale = growthInput[i];
  return {
    scale: Math.abs(signedScale),
    growthType: signedScale > 0.0 ? 'branching' : 'faceting',
  };
}

function darken(snowflake: Snowflake): void {
  const newBranches = [];
  const newFaces = [];
  for (let i = 0; i < snowflake.branches.length; i += 1) {
    const branch = snowflake.branches[i];
    if (branch.growing) {
      newBranches.push({
        growing: false,
        start: { x: branch.start.x, y: branch.start.y },
        size: branch.size,
        length: branch.length,
        direction: branch.direction,
      });
    }
  }
  for (let i = 0; i < snowflake.faces.length; i += 1) {
    const face = snowflake.faces[i];
    if (face.growing) {
      newFaces.push({
        growing: false,
        center: { x: face.center.x, y: face.center.y },
        size: face.size,
        direction: face.direction,
      });
    }
  }
  for (let i = 0; i < newBranches.length; i += 1) {
    snowflake.branches.push(newBranches[i]);
  }
  for (let i = 0; i < newFaces.length; i += 1) {
    snowflake.faces.push(newFaces[i]);
  }
}

type Ray = {
  start: Point,
  // end is implied to be (0, 0)
};

function buildRay(theta: number): Ray {
  const radius = 2;
  return {
    start: {
      x: radius * Math.cos(theta),
      y: radius * Math.sin(theta),
    },
  };
}

function castRaysAtGrowingParts(snowflake: Snowflake): void {
  const numRays = 50;
  const theta = Math.PI * 2 / 50;
  for (let i = 0; i < numRays; i += 1) {
    const ray = buildRay(theta * i);
    recordRayIntersections(snowflake, ray);
  }
}

function squareDistance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return dx * dx + dy * dy;
}

function recordRayIntersections(snowflake: Snowflake, ray: Ray): void {
  const r = (() => {
    const r1 = firstRayFaceIntersection(snowflake.faces, ray);
    const r2 = firstRayBranchIntersection(snowflake.branches, ray);
    if (r1 === undefined) {
      return r2;
    }
    return r1;
  })();
}

type RayHit<T> = {
  ray: Ray,
  hit: T,
};

type MaybeRayHit<T> = undefined | RayHit<T>;

function firstRayFaceIntersection(faces: Array<Face>, ray: Ray): MaybeRayHit<Face> {
  const smallestDistance = Infinity;
  let result = undefined;

  for (let i = 0; i < faces.length; i += 1) {
    const circle = {
      center: copyPoint(face.center),
      radius: face.size,
    };
    const maybeIntersection = findCircleRayIntersection(circle, ray);
    if (maybeIntersection !== undefined) {
      const dist = squareDistance(ray.start, circle.center);
      if (dist < smallestDistance) {
        result = {
          ray,
          hit: face,
        };
      }
    }
  }

  return result;
}

function findCircleRayIntersection(circle: Circle, ray: Ray): undefined | {

}

//function recordRayIntersections(snowflake: Snowflake, ray: Ray): void {
//  type DiscriminantRecord = undefined | {
//    value: number,
//    index: number,
//    kind: 'face' | 'branch',
//  };
//  let record: DiscriminantRecord = undefined;
//
//  for (i = 0; i < snowflake.faces.length; i += 1) {
//    let face = snowflake.faces[i];
//    if (face.growing) {
//      let circle = {
//        center: { x: face.center.x, y: face.center.y },
//        radius: face.size,
//      };
//      let discriminant = rayCircleDiscriminant(ray, circle);
//      if (rayIntersectsCircle(ray, circle)) {
//        if 
//      }
//    }
//  }
//}

type Circle = {
  center: Point,
  radius: number,
};

function rayCircleDiscriminant(ray: Ray, circle: Circle): number {
  // from https://mathworld.wolfram.com/Circle-LineIntersection.html
  const x1 = ray.start.x - circle.center.x;
  const y1 = ray.start.y - circle.center.y;
  const x2 = -circle.center.x;
  const y2 = -circle.center.y;
  const r = circle.radius;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dr = Math.sqrt(dx * dx + dy * dy);
  const D = x1 * y2 - x2 * y1;
  const discriminant = r * r * dr - D * D;
  return discriminant;
}

const updateInterval = 5;
const maxSteps = 6000;
let snowflake = createInitialSnowflake();
let step = 0;
let intervalId = undefined;
let currentGrowthType = undefined;

function currentTime(): number {
  return step / maxSteps;
}

function update() {
  step += 1;

  // if (step % 100 === 0) {
  //   darken(snowflake);
  // }

  const growth = interpretGrowth(currentTime());

  if (currentGrowthType === undefined) {
    currentGrowthType = growth.growthType;
  }

  if (currentGrowthType !== growth.growthType) {
    currentGrowthType = growth.growthType;
    if (currentGrowthType === 'branching') {
      addBranchesToGrowingFaces(snowflake);
    } else {
      addFacesToGrowingBranches(snowflake);
    }
  }

  if (currentGrowthType === 'branching') {
    enlargeGrowingBranches(snowflake, growth.scale);
  } else {
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

function test(cond: boolean, name: string): void {
  if (!cond) {
    console.error(`Test failure: ${name}`);
  } else {
    console.log(`Test success: ${name}`);
  }
}

function testBranchEnd(): void {
  let r1 = branchEnd({
    rayHits: 0,
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

testBranchEnd();
// testRayIntersectsCircle();
