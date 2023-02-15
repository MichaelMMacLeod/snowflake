type Graphic = {
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
};

function makeGraphic(): Graphic {
  const canvas = document.getElementById('snowflake') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d');
  const lightBlue = 'rgba(90, 211, 255, 1.0)';
  
  ctx.fillStyle = lightBlue;
  
  return { canvas, ctx };
}

const graphic = makeGraphic();

type RGBA = `rgba(${number}, ${number}, ${number}, ${number})`;

type Graph = {
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  handleBeingDragged: undefined | number | 'needs lookup',
  mouseRecentlyExitedGraph: boolean,
  graphMouse: Point,
  background: RGBA,
};

function makeGraph(): Graph {
  const canvas = document.getElementById('graph') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d');
  const graphMouse = { x: 0, y: 0 };
  const background: RGBA = 'rgba(90, 211, 255, 0.5)';
  const result = {
    canvas,
    ctx,
    handleBeingDragged: undefined,
    mouseRecentlyExitedGraph: false,
    graphMouse,
    background,
  };

  canvas.addEventListener('mousemove', e => {
    graphMouse.x = e.offsetX;
    graphMouse.y = e.offsetY;
  });
  canvas.addEventListener('mousedown', e => {
    result.handleBeingDragged = 'needs lookup';
  });
  canvas.addEventListener('mouseup', e => {
    result.handleBeingDragged = undefined;
  });
  canvas.addEventListener('mouseleave', e => {
    result.mouseRecentlyExitedGraph = true;
  });
  
  return result;
};

const graph = makeGraph();

type Controls = {
  pause: HTMLButtonElement;
  reset: HTMLButtonElement;
  playing: boolean;
};

function makeControls(): Controls {
  const pause = document.getElementById('pause') as HTMLButtonElement;
  const reset = document.getElementById('reset') as HTMLButtonElement;
  const result = { pause, reset, playing: true };
  
  pause.addEventListener('click', e => {
    result.playing = !result.playing;
    if (result.playing) {
      pause.innerHTML = 'pause';
      graphic.canvas.className = '';
    } else {
      pause.innerHTML = 'play';
      graphic.canvas.className = 'paused';
    }
  });

  reset.addEventListener('click', e => {
    resetSnowflake();
  });
  
  return result;
}

const controls = makeControls();

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

type Faces = {
  growing: Array<Face>,
  grown: Array<Face>,
  waiting: Array<Face>,
};

type Branches = {
  growing: Array<Branch>,
  grown: Array<Branch>,
  waiting: Array<Branch>,
};

type Snowflake = {
  faces: Faces,
  branches: Branches,
};

type Face = {
  rayHits: number,
  center: Point,
  size: number,
  direction: Direction | 'none',
  growthScale: number,
};

type Branch = {
  rayHits: number,
  start: Point,
  size: number,
  length: number,
  direction: Direction,
  growthScale: number,
}

function branchEnd(branch: Branch): Point {
  let d = directions[branch.direction];
  let l = branch.length;
  let x = branch.start.x + l * Math.cos(d);
  let y = branch.start.y + l * Math.sin(d);
  return { x, y };
}

function drawSnowflake(snowflake: Snowflake): void {
  snowflake.faces.growing.forEach(drawFace);
  snowflake.faces.grown.forEach(drawFace);
  snowflake.branches.growing.forEach(drawBranch);
  snowflake.branches.grown.forEach(drawBranch);
}

function drawFace(face: Face): void {
  const center = toCanvasPoint(face.center);
  const size = toCanvasSize(face.size);
  graphic.ctx.beginPath();
  graphic.ctx.moveTo(center.x + size, center.y);
  for (let dir: Direction = 1; dir < 6; dir += 1) {
    const x = center.x + size * Math.cos(directions[dir]);
    const y = center.y - size * Math.sin(directions[dir]);
    graphic.ctx.lineTo(x, y);
  }
  graphic.ctx.closePath();
  graphic.ctx.fill();
}

function rem(x: number, m: number): number {
  return ((x % m) + m) % m;
}

function drawBranch(branch: Branch): void {
  const startCenter = toCanvasPoint(branch.start);
  const endCenter = toCanvasPoint(branchEnd(branch));
  const size = toCanvasSize(branch.size);
  let dir = rem(branch.direction - 2, directions.length);
  graphic.ctx.beginPath();
  {
    const x = startCenter.x + size * Math.cos(directions[dir]);
    const y = startCenter.y - size * Math.sin(directions[dir]);
    graphic.ctx.moveTo(x, y);
  }
  for (let i = 0; i < 2; i += 1) {
    dir = rem(dir - 1, directions.length);
    const x = startCenter.x + size * Math.cos(directions[dir]);
    const y = startCenter.y - size * Math.sin(directions[dir]);
    graphic.ctx.lineTo(x, y);
  }
  for (let i = 0; i < 3; i += 1) {
    dir = rem(dir - 1, directions.length);
    const x = endCenter.x + size * Math.cos(directions[dir]);
    const y = endCenter.y - size * Math.sin(directions[dir]);
    graphic.ctx.lineTo(x, y);
  }
  graphic.ctx.closePath();
  graphic.ctx.fill();
}

function toCanvasSize(n: number): number {
  const smallestDimension = Math.min(graphic.canvas.width, graphic.canvas.height);
  return n * smallestDimension;
}

function toCanvasPoint(p: Point): Point {
  const result = { x: p.x, y: p.y };

  result.x *= graphic.canvas.width / 2;
  result.y *= -graphic.canvas.height / 2;

  result.x += graphic.canvas.width * 0.5;
  result.y += graphic.canvas.height * 0.5;

  return result;
}

function createInitialSnowflake(): Snowflake {
  return {
    faces: {
      growing: [{
        rayHits: 0,
        center: { x: 0, y: 0 },
        size: 0.0025,
        direction: 'none',
        growthScale: 1,
      }],
      grown: [],
      waiting: [],
    },
    branches: {growing: [], grown: [], waiting: [] },
  };
}

const growthScalar = 0.0001;
const branchGrowthScalar = growthScalar * 0.3;

function enlargeGrowingFaces(snowflake: Snowflake, scale: number): void {
  snowflake.faces.growing.forEach(face => {
    face.size += 0.75 * scale * growthScalar * face.growthScale;
    if (face.direction !== 'none') {
      const dx = 0.75 * 2 * scale * growthScalar * Math.cos(directions[face.direction]) * face.growthScale;
      const dy = 0.75 * 2 * scale * growthScalar * Math.sin(directions[face.direction]) * face.growthScale;
      face.center.x += dx;
      face.center.y += dy;
    }
  })
}

function enlargeGrowingBranches(snowflake: Snowflake, scale: number): void {
  snowflake.branches.growing.forEach(branch => {
    const lengthScalar = -1.5 * scale + 1.5;
    const sizeScalar = 1.5 * scale;
    branch.size += sizeScalar * branchGrowthScalar * branch.growthScale;
    branch.length += lengthScalar * growthScalar * branch.growthScale;
  })
}

function addBranchesToGrowingFaces(snowflake: Snowflake): void {
  snowflake.faces.growing.forEach(face => {
    snowflake.faces.waiting.push(face);
    addBranchesToFace(snowflake, face);
  })
}

function addFacesToGrowingBranches(snowflake: Snowflake): void {
  snowflake.branches.growing.forEach(branch => {
    snowflake.branches.waiting.push(branch);
    addFaceToBranch(snowflake, branch);
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
    const growthScale = (() => {
      if (face.direction === 'none' || i === 1) {
        return face.growthScale * 0.9;
      }

      const randomAdjust = Math.random() * 0.5 + 0.5;
      return face.growthScale * 0.5 * randomAdjust;
    })();
    snowflake.branches.growing.push({
      rayHits: 0,
      start: { x, y },
      size: sizeOfNewBranches,
      length: 0,
      direction: dir as Direction,
      growthScale,
    });
    dir = nextDirection(dir);
  }
}

function addFaceToBranch(snowflake: Snowflake, branch: Branch): void {
  snowflake.faces.growing.push({
    rayHits: 0,
    center: branchEnd(branch),
    size: branch.size,
    direction: branch.direction,
    growthScale: branch.growthScale,
  });
}


type NonEmptyArray<T> = { 0: T } & Array<T>;
type GrowthFunction = (time: number) => Growth;
type Growth = { scale: number, growthType: GrowthType };
type GrowthType = 'branching' | 'faceting';

function clamp(x: number, low: number, high: number): number {
  return Math.min(Math.max(x, low), high);
}

let growthInput: NonEmptyArray<number> = [0, 5, 8, 8, 3, 5, 3, 2, 6, 3, 6, 3];
const yChoices: Array<number> =
  [-1, -0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75, 1];

function drawGraphHandle(
  x: number,
  y: number,
  isSelected: boolean,
  isBeingDragged: boolean
): void {
  const oldFillStyle = graph.ctx.fillStyle;
  const oldStrokeStyle = graph.ctx.strokeStyle;
  const oldLineDash = graph.ctx.getLineDash();

  const newStyle = 'black';

  const outerRingRadius = (() => {
    if (isSelected) {
      return 8;
    } else {
      return 5;
    }
  })();

  const newLineDash = (() => {
    if (isBeingDragged) {
      return [2, 2];
    } else {
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

function growthHandlePosition(i: number): Point {
  return {
    x: writableGraphWidth / (growthInput.length - 1) * i + graphMargin,
    y: 4 * yChoices[growthInput[i]] * (writableGraphHeight / yChoices.length) + writableGraphHeight * 0.5,
  };
}

function nearestGrowthHandle(canvasPoint: Point): number {
  let nearestDist = Infinity;
  let nearest = 0;

  for (let i = 0; i < growthInput.length; i += 1) {
    const p = growthHandlePosition(i);
    const dx = p.x - canvasPoint.x;
    const dist = dx * dx;
    if (dist < nearestDist) {
      nearestDist = dist;
      nearest = i;
    }
  }

  return nearest;
}

const graphMargin = 10;
const writableGraphWidth = graph.canvas.width - 2 * graphMargin;
const writableGraphHeight = graph.canvas.height;

function drawGrowthInput(): void {
  const dx = writableGraphWidth / (growthInput.length - 1);
  const dy = writableGraphHeight / yChoices.length;
  const percentDone = step / maxSteps;

  const old = graph.ctx.fillStyle;
  graph.ctx.fillStyle = graph.background;
  graph.ctx.fillRect(
    graphMargin,
    0,
    writableGraphWidth * percentDone,
    writableGraphHeight
  );
  graph.ctx.fillStyle = old;
  graph.ctx.beginPath();

  {
    const p = growthHandlePosition(0);
    graph.ctx.moveTo(p.x, p.y);
  }
  for (let i = 1; i < growthInput.length; i += 1) {
    const p = growthHandlePosition(i);
    graph.ctx.lineTo(p.x, p.y);
  }
  graph.ctx.strokeStyle = 'black';
  graph.ctx.stroke();

  const nearest = nearestGrowthHandle(graph.graphMouse);
  for (let i = 0; i < growthInput.length; i += 1) {
    const p = growthHandlePosition(i);
    drawGraphHandle(p.x, p.y, i === nearest, i === graph.handleBeingDragged);
  }

  graph.ctx.beginPath();
  const progressX = writableGraphWidth * percentDone + graphMargin;
  graph.ctx.moveTo(progressX, 0);
  graph.ctx.lineTo(progressX, writableGraphHeight);
  graph.ctx.strokeStyle = 'blue';
  graph.ctx.stroke();

  graph.ctx.beginPath();
  const xAxisY = writableGraphHeight * 0.5;
  graph.ctx.moveTo(graphMargin, xAxisY);
  graph.ctx.lineTo(writableGraphWidth + graphMargin, xAxisY);
  graph.ctx.strokeStyle = 'black';
  graph.ctx.setLineDash([2, 2]);
  graph.ctx.stroke()
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

function interpretGrowth(time: number): Growth {
  let s = lerp(0, growthInput.length - 1, time);
  let n = fracPart(s);
  let a = yChoices[growthInput[Math.floor(s)]];
  let b = yChoices[growthInput[Math.ceil(s)]];
  let signedScale = lerp(a, b, n);
  let timeScalar = -0.01 * s + 1;
  return {
    scale: timeScalar * Math.abs(signedScale),
    growthType: signedScale > 0.0 ? 'branching' : 'faceting',
  };
}

type Ray = {
  start: Point,
  // end is implied to be (0, 0)
};

function buildRay(theta: number): Ray {
  const radius = 10;
  return {
    start: {
      x: radius * Math.cos(theta),
      y: radius * Math.sin(theta),
    },
  };
}

function drawRay(ray: Ray): void {
  const start = toCanvasPoint(ray.start);
  const end = toCanvasPoint({ x: 0, y: 0 });
  graphic.ctx.beginPath();
  graphic.ctx.moveTo(start.x, start.y);
  graphic.ctx.lineTo(end.x, end.y);
  graphic.ctx.closePath();
  graphic.ctx.stroke();
}

function castRaysAtGrowingParts(snowflake: Snowflake): void {
  snowflake.faces.growing.forEach(face => face.rayHits = 0);
  snowflake.branches.growing.forEach(branch => branch.rayHits = 0);

  const numRays = 200;
  const theta = Math.PI * 2 / numRays;
  for (let i = 0; i < numRays; i += 1) {
    const ray = buildRay(theta * i);
    const intersection = firstRayIntersection(snowflake, ray);
    if (intersection !== undefined) {
      intersection.rayHits += 1;
    }
  }

  snowflake.faces.growing.forEach(face => {
    if (face.rayHits === 0) {
      snowflake.faces.waiting.push(face);
    }
  });
  snowflake.branches.growing.forEach(branch => {
    if (branch.rayHits === 0) {
      snowflake.branches.waiting.push(branch);
    }
  });
}

function squareDistance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return dx * dx + dy * dy;
}

function distance(p1: Point, p2: Point): number {
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

type RayHit<T> = {
  ray: Ray,
  hit: T,
};

type MaybeRayHit<T> = undefined | RayHit<T>;

function firstRayIntersection(
  snowflake: Snowflake, ray: Ray
): undefined | Face | Branch {
  let smallestDistance = Infinity;
  let smallestDistancePoint: undefined | Point = undefined;
  let result: undefined | Face | Branch = undefined;

  function updateIntersection(
    i: undefined | Point,
    v: Face | Branch,
    r: Ray,
  ): void {
    if (i === undefined) {
      return;
    }

    if (smallestDistancePoint === undefined) {
      smallestDistancePoint = i;
    }

    const d = squareDistance(i, r.start);
    if (d < smallestDistance) {
      smallestDistance = d;
      smallestDistancePoint = i;
      result = v;
    }
  }

  snowflake.faces.growing.forEach(face => {
    const circle = {
      center: copyPoint(face.center),
      radius: face.size,
    };
    circle.radius = Math.max(circle.radius, 0.01);
    const intersection = findCircleRayIntersection(circle, ray);
    updateIntersection(intersection, face, ray);
  });

  snowflake.branches.growing.forEach(branch => {
    createCirclesAlongBranch(branch).forEach(circle => {
      const intersection = findCircleRayIntersection(circle, ray);
      updateIntersection(intersection, branch, ray);
    });
  });

  return result;
}

function createCirclesAlongBranch(branch: Branch): Array<Circle> {
  if (branch.size === 0) {
    return [];
  }

  const result = [];
  const numCircles = Math.min(Math.ceil(branch.length / branch.size), 10);
  const end = branchEnd(branch);
  const dx = (end.x - branch.start.x) / numCircles;
  const dy = (end.y - branch.start.y) / numCircles;
  const radius = Math.max(branch.size, 0.01);

  for (let i = 0; i <= numCircles; i += 1) {
    const x = branch.start.x + dx * i;
    const y = branch.start.y + dy * i;

    result.push({
      center: { x, y },
      radius,
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
function findCircleRayIntersection(circle: Circle, ray: Ray): undefined | Point {
  const rx = ray.start.x;
  const ry = ray.start.y;
  const cx = circle.center.x;
  const cy = circle.center.y;
  const cr = circle.radius;

  const cr2 = cr * cr;
  const cx2 = cx * cx;
  const cy2 = cy * cy;
  const rx2 = rx * rx;
  const ry2 = ry * ry;

  const t1 = (cr2 - cx2) * ry2 + 2 * cx * cy * rx * ry + (cr2 - cy2) * rx2;

  if (t1 < 0) {
    return undefined;
  }

  const t1sqrt = Math.sqrt(t1);
  const t2 = cy * rx * ry + cx * rx2;
  const t3 = cy * ry2 + cx * rx * ry;
  const t4 = ry2 + rx2;

  const ix = (rx * t1sqrt + t2) / t4;
  const iy = (ry * t1sqrt + t3) / t4;

  return { x: ix, y: iy };
}

function testFindCircleRayIntersection(): void {
  const circle = {
    center: {
      x: 4.4,
      y: -6.5,
    },
    radius: 6,
  };
  const ray = {
    start: {
      x: 18,
      y: -11.6,
    }
  };
  let r1 = findCircleRayIntersection(circle, ray);
  test(Math.abs(r1.x - 10.39) < 0.01, "testFindRayCircleIntersection1");
  test(Math.abs(r1.y - -6.70) < 0.01, "testFindRayCircleIntersection2");
}
//testFindCircleRayIntersection();

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

function resetSnowflake(): void {
  snowflake = createInitialSnowflake();
  step = 0;
  currentGrowthType = undefined;
  clearSnowflakeCanvas();
}

function currentTime(): number {
  return step / maxSteps;
}

function updateGraph(): void {
  if (graph.handleBeingDragged !== undefined || graph.mouseRecentlyExitedGraph) {
    graph.mouseRecentlyExitedGraph = false;
    const handle = (() => {
      if (graph.handleBeingDragged === 'needs lookup') {
        return nearestGrowthHandle(graph.graphMouse);
      } else {
        return graph.handleBeingDragged;
      }
    })();

    if (graph.handleBeingDragged === 'needs lookup') {
      graph.handleBeingDragged = handle;
    }

    const dy = writableGraphHeight / yChoices.length;
    const i = Math.floor(graph.graphMouse.y / dy);
    growthInput[handle] = clamp(i, 0, yChoices.length - 1);
    //while (growthInput[handle] > 0 && growthHandlePosition(handle).y > graph.graphMouse.y) {
    //  growthInput[handle] -= 1;
    //}
    //while (growthInput[handle] < yChoices.length && growthHandlePosition(handle).y < graph.graphMouse.y) {
    //  growthInput[handle] += 1;
    //}
  }
}


function deleteSortedElementsFromSortedArray<T>(removeArray: Array<T>, elements: Array<T>) {
  let completed = 0;
  let removePos = 0;
  let elementPos = 0;
  while (removePos < removeArray.length) {
    if (removeArray[removePos] === elements[elementPos]) {
      elementPos += 1;
    } else {
      removeArray[completed] = removeArray[removePos];
      completed += 1;
    }
    removePos += 1;
  }
  removeArray.splice(completed);
}

function moveBranchesAndFaces() {
  deleteSortedElementsFromSortedArray(snowflake.faces.growing, snowflake.faces.waiting);
  deleteSortedElementsFromSortedArray(snowflake.branches.growing, snowflake.branches.waiting);
  snowflake.faces.grown.splice(snowflake.faces.grown.length, 0, ...snowflake.faces.waiting);
  snowflake.branches.grown.splice(snowflake.branches.grown.length, 0, ...snowflake.branches.waiting);
  snowflake.faces.waiting.splice(0);
  snowflake.branches.waiting.splice(0);
}

function update(): void {
  if (step < maxSteps && controls.playing) {
    step += 1;

    castRaysAtGrowingParts(snowflake);

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

    moveBranchesAndFaces();

    if (currentGrowthType === 'branching') {
      enlargeGrowingBranches(snowflake, growth.scale);
    } else {
      enlargeGrowingFaces(snowflake, growth.scale);
    }

    clearSnowflakeCanvas();
    drawSnowflake(snowflake);
  }

  updateGraph();
  graph.ctx.clearRect(0, 0, graph.canvas.width, graph.canvas.height);
  drawGrowthInput();
}

function clearSnowflakeCanvas(): void {
  graphic.ctx.clearRect(0, 0, graphic.canvas.width, graphic.canvas.height);
}

intervalId = window.setInterval(update, updateInterval);

function test(cond: boolean, name: string): void {
  if (!cond) {
    console.error(`Test failure: ${name}`);
  } else {
    console.log(`Test success: ${name}`);
  }
}

function arraysEqual<T>(xs: Array<T>, ys: Array<T>) {
  if (xs === ys) return true;
  if (xs.length !== ys.length) return false;
  for (let i = 0; i < xs.length; i += 1) {
    if (xs[i] !== ys[i]) return false;
  }
  return true;
}

function testDelete() {
  {
    const letters = ['a','b','c','d','e','f','g','h','i'];
    const vowels = ['a','e','i'];
    deleteSortedElementsFromSortedArray(letters, vowels);
    test(arraysEqual(letters, ['b','c','d','f','g','h']), `1: Letters was ${letters}`);
  }
  {
    const letters = ['a','b','c','d','e','f','g','h'];
    const vowels = ['a','e'];
    deleteSortedElementsFromSortedArray(letters, vowels);
    test(arraysEqual(letters, ['b','c','d','f','g','h']), `2: Letters was ${letters}`);
  }
}
