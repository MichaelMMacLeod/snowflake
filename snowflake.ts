const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d');
const graphCanvas = document.getElementById('graph') as HTMLCanvasElement;
const graphCtx = graphCanvas.getContext('2d');

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

function nextDirection(d: Direction): Direction {
  return ((d + 1) % directions.length) as Direction;
}

function previousDirection(d: Direction): Direction {
  return rem(d - 1, directions.length) as Direction;
}

type Point = { x: number, y: number };

type Snowflake = {
  faces: Array<Face>,
  branches: Array<Branch>,
};

type Face = {
  growing: boolean,
  center: Point,
  size: number,
  direction: Direction | 'none',
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
      direction: 'none',
    }],
    branches: [],
  };
}

const growthScalar = 0.0001;
const branchGrowthScalar = growthScalar * 0.3;

function enlargeGrowingFaces(snowflake: Snowflake): void {
  snowflake.faces.forEach(face => {
    if (face.growing) {
      face.size += growthScalar;
      if (face.direction !== 'none') {
        const dx = 2 * growthScalar * Math.cos(directions[face.direction]);
        const dy = 2 * growthScalar * Math.sin(directions[face.direction]);
        face.center.x += dx;
        face.center.y += dy;
      }
    }
  })
}

function enlargeGrowingBranches(snowflake: Snowflake): void {
  snowflake.branches.forEach(branch => {
    if (branch.growing) {
      branch.size += branchGrowthScalar;
      branch.length += growthScalar;
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
  for (let dir: Direction = 0; dir < directions.length; dir += 1) {
    const x = cx + distFromCenter * Math.cos(directions[dir]);
    const y = cy + distFromCenter * Math.sin(directions[dir]);
    snowflake.branches.push({
      growing: true,
      start: { x, y },
      size: sizeOfNewBranches,
      length: 0,
      direction: dir as Direction,
    });
  }
}

function addFaceToBranch(snowflake: Snowflake, branch: Branch): void {
  snowflake.faces.push({
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

let growthInput: NonEmptyArray<number> = [-1, 1, -1];

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

const updateInterval = 10;
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
    enlargeGrowingBranches(snowflake);
  } else {
    enlargeGrowingFaces(snowflake);
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

testBranchEnd();
