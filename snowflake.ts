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

type Graphic = {
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
};

function makeGraphic(): Graphic | undefined {
  const canvas = document.getElementById('snowflake') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d');

  if (ctx === null) {
    return undefined;
  }
  
  const lightBlue = 'rgba(90, 211, 255, 1.0)';
  
  ctx.fillStyle = lightBlue;
  
  return { canvas, ctx };
}

type RGBA = `rgba(${number}, ${number}, ${number}, ${number})`;

type Graph = {
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  handleBeingDragged: undefined | number | 'needs lookup',
  mouseRecentlyExitedGraph: boolean,
  graphMouse: Point,
  background: RGBA,
};

function makeGraph(): Graph | undefined {
  const canvas = document.getElementById('graph') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d');

  if (ctx === null) {
    return undefined;
  }
  
  const graphMouse = { x: 0, y: 0 };
  const background: RGBA = 'rgba(90, 211, 255, 0.5)';
  const result: Graph = {
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

type Controls = {
  pause: HTMLButtonElement;
  reset: HTMLButtonElement;
  playing: boolean;
};

function makeControls(graphic: Graphic): Controls {
  const pause = document.getElementById('pause') as HTMLButtonElement;
  const reset = document.getElementById('reset') as HTMLButtonElement;
  return { pause, reset, playing: true };  
}

function registerControlsEventListeners(state: State): void {
  const { controls, graphic } = state;
  const { pause, reset } = controls;

  pause.addEventListener('click', e => {
    controls.playing = !controls.playing;
    if (controls.playing) {
      pause.innerHTML = 'pause';
      graphic.canvas.className = '';
    } else {
      pause.innerHTML = 'play';
      graphic.canvas.className = 'paused';
    }
  });

  reset.addEventListener('click', e => {
    resetSnowflake(state);
  });
}

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

function isDirection(i: number): i is Direction {
  return i === 0 || i === 1 || i === 2 ||
    i === 3 || i === 4 || i === 5;
}

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

function addPoints(p1: Point, p2: Point): Point {
  return { x: p1.x + p2.x, y: p1.y + p2.y };
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

const defaultPoint: Point = { x: 0, y: 0 };

const defaultFace: Face = {
  rayHits: 0,
  center: defaultPoint,
  size: 0.0025,
  direction: 'none',
  growthScale: 1,
};

type Branch = {
  rayHits: number,
  start: Point,
  size: number,
  length: number,
  direction: Direction,
  growthScale: number,
}

const defaultBranch: Branch = {
  rayHits: 0,
  start: defaultPoint,
  size: 0.0025,
  length: 0.005,
  direction: 0,
  growthScale: 1,
};

function branchEnd(branch: Branch): Point {
  let d = directions[branch.direction];
  let l = branch.length;
  let x = branch.start.x + l * Math.cos(d);
  let y = branch.start.y + l * Math.sin(d);
  return { x, y };
}

function drawSnowflake(graphic: Graphic, snowflake: Snowflake): void {
  snowflake.faces.growing.forEach(f => drawFace(graphic, f));
  snowflake.faces.grown.forEach(f => drawFace(graphic, f));
  snowflake.branches.growing.forEach(b => drawBranch(graphic, b));
  snowflake.branches.grown.forEach(b => drawBranch(graphic, b));
}

function worldToViewTransform(graphic: Graphic, p: Point): Point {
  const w = graphic.canvas.width;
  const h = graphic.canvas.height;
  // affine transform:
  // |r.x|   |w/2   0   w/2|   |p.x|
  // |r.y| = |0   -h/2  h/2| * |p.y|
  // | 1 |   |0     0    1 |   | 1 |
  const r: Point = {
    x: p.x * w * 0.5 + w * 0.5,
    y: p.y * -h * 0.5 + h * 0.5, 
  };
  return r;
}

function drawFace(graphic: Graphic, face: Face): void {
  graphic.ctx.beginPath();
  getFacePoints(face).forEach((p, i) => {
    const { x, y } = worldToViewTransform(graphic, p);
    if (i === 0) {
      graphic.ctx.moveTo(x, y);
    } else {
      graphic.ctx.lineTo(x, y);
    }
  });
  graphic.ctx.closePath();
  graphic.ctx.fillStyle = 'rgba(0, 0, 255, 0.2)';
  graphic.ctx.fill();
}

function rem(x: number, m: number): number {
  return ((x % m) + m) % m;
}

function drawBranch(graphic: Graphic, branch: Branch): void {
  graphic.ctx.beginPath();
  getBranchPoints(branch).forEach((p, i) => {
    const { x, y } = worldToViewTransform(graphic, p);
    if (i === 0) {
      graphic.ctx.moveTo(x, y);
    } else {
      graphic.ctx.lineTo(x, y);
    }
  });
  graphic.ctx.closePath();
  graphic.ctx.fill();
}

// function toCanvasPoint(p: Point): Point {
//   const result = { x: p.x, y: p.y };

//   result.x *= graphic.canvas.width / 2;
//   result.y *= -graphic.canvas.height / 2;

//   result.x += graphic.canvas.width * 0.5;
//   result.y += graphic.canvas.height * 0.5;

//   return result;
// }

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
      const dx = 0.75 * 1 * scale * growthScalar * Math.cos(directions[face.direction]) * face.growthScale;
      const dy = 0.75 * 1 * scale * growthScalar * Math.sin(directions[face.direction]) * face.growthScale;
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
  const distFromCenter = 1 * face.size * (1 - initialFraction);
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

      const randomAdjust = 1;
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
  graph: Graph,
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

function growthHandlePosition(
  writableGraphWidth: number,
  writableGraphHeight: number,
  graphMargin: number,
  i: number): Point
{
  return {
    x: writableGraphWidth / (growthInput.length - 1) * i + graphMargin,
    y: 4 * yChoices[growthInput[i]] * (writableGraphHeight / yChoices.length) + writableGraphHeight * 0.5,
  };
}

function nearestGrowthHandle(state: State, canvasPoint: Point): number {
  const {
    writableGraphWidth,
    writableGraphHeight,
    graphMargin,
  } = state;

  let nearestDist = Infinity;
  let nearest = 0;

  for (let i = 0; i < growthInput.length; i += 1) {
    const p = growthHandlePosition(
      writableGraphWidth,
      writableGraphHeight,
      graphMargin,
      i);
    const dx = p.x - canvasPoint.x;
    const dist = dx * dx;
    if (dist < nearestDist) {
      nearestDist = dist;
      nearest = i;
    }
  }

  return nearest;
}

function drawGrowthInput(state: State): void {
  const {
    graph,
    writableGraphWidth,
    writableGraphHeight,
    graphMargin,
    step,
    maxSteps,
  } = state;

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
    const p = growthHandlePosition(
      writableGraphWidth,
      writableGraphHeight,
      graphMargin,
      0);
    graph.ctx.moveTo(p.x, p.y);
  }
  for (let i = 1; i < growthInput.length; i += 1) {
    const p = growthHandlePosition(
      writableGraphWidth,
      writableGraphHeight,
      graphMargin,
      i);
    graph.ctx.lineTo(p.x, p.y);
  }
  graph.ctx.strokeStyle = 'black';
  graph.ctx.stroke();

  const nearest = nearestGrowthHandle(state, graph.graphMouse);
  for (let i = 0; i < growthInput.length; i += 1) {
    const p = growthHandlePosition(
      writableGraphWidth,
      writableGraphHeight,
      graphMargin,
      i);
    drawGraphHandle(graph, p.x, p.y, i === nearest, i === graph.handleBeingDragged);
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

function lerp(a: number, b: number, n: number) {
  return (1 - n) * a + n * b;
}

function fracPart(n: number) {
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

function drawRay(graphic: Graphic, ray: Ray): void {
  const start = worldToViewTransform(graphic, ray.start);
  const end = worldToViewTransform(graphic, { x: 0, y: 0 });
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

  const result: Array<Circle> = [];
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
  if (r1 === undefined) {
    console.error("no intersection");
  } else {
    test(Math.abs(r1.x - 10.39) < 0.01, "testFindRayCircleIntersection1");
    test(Math.abs(r1.y - -6.70) < 0.01, "testFindRayCircleIntersection2");
  }
}

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

function currentTime(state: State): number {
  const { step, maxSteps } = state;
  return step / maxSteps;
}

function updateGraph(state: State): void {
  const { graph, writableGraphHeight } = state;
  if (graph.handleBeingDragged !== undefined || graph.mouseRecentlyExitedGraph) {
    graph.mouseRecentlyExitedGraph = false;
    const handle: number | undefined = (() => {
      if (graph.handleBeingDragged === 'needs lookup') {
        return nearestGrowthHandle(state, graph.graphMouse);
      } else {
        return graph.handleBeingDragged;
      }
    })();

    if (graph.handleBeingDragged === 'needs lookup') {
      graph.handleBeingDragged = handle;
    }

    const dy = writableGraphHeight / yChoices.length;
    const i = Math.floor(graph.graphMouse.y / dy);
    if (handle !== undefined) {
      growthInput[handle] = clamp(i, 0, yChoices.length - 1);
    }
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

function moveBranchesAndFaces(snowflake: Snowflake) {
  deleteSortedElementsFromSortedArray(snowflake.faces.growing, snowflake.faces.waiting);
  deleteSortedElementsFromSortedArray(snowflake.branches.growing, snowflake.branches.waiting);
  snowflake.faces.grown.splice(snowflake.faces.grown.length, 0, ...snowflake.faces.waiting);
  snowflake.branches.grown.splice(snowflake.branches.grown.length, 0, ...snowflake.branches.waiting);
  snowflake.faces.waiting.splice(0);
  snowflake.branches.waiting.splice(0);
}

function update(state: State): void {
  const {
    snowflake,
    graph,
    graphic,
    maxSteps,
    controls,
  } = state;
  if (state.step < maxSteps && controls.playing) {
    state.step += 1;

    castRaysAtGrowingParts(snowflake);

    const growth = interpretGrowth(currentTime(state));

    if (state.currentGrowthType === undefined) {
      state.currentGrowthType = growth.growthType;
    }

    if (state.currentGrowthType !== growth.growthType) {
      state.currentGrowthType = growth.growthType;
      if (state.currentGrowthType === 'branching') {
        addBranchesToGrowingFaces(snowflake);
      } else {
        addFacesToGrowingBranches(snowflake);
      }
    }

    moveBranchesAndFaces(snowflake);

    if (state.currentGrowthType === 'branching') {
      enlargeGrowingBranches(snowflake, growth.scale);
    } else {
      enlargeGrowingFaces(snowflake, growth.scale);
    }

    clearSnowflakeCanvas(graphic);
    drawSnowflake(graphic, snowflake);
  }

  updateGraph(state);
  graph.ctx.clearRect(0, 0, graph.canvas.width, graph.canvas.height);
  drawGrowthInput(state);
}

function clearSnowflakeCanvas(graphic: Graphic): void {
  graphic.ctx.clearRect(0, 0, graphic.canvas.width, graphic.canvas.height);
}

function test(cond: boolean, name: string): void {
  if (!cond) {
    console.error(`Test failure: ${name}`);
  } else {
    console.log(`Test success: ${name}`);
  }
}

function testEq(a: any, b: any, name: string): void {
  if (a === b) {
    console.log(`Test success: ${name}`);
  } else {
    console.error(`Test failure: ${name}; ${a} === ${b} is false`);
  }
}

function testAbs(a: number, b: number, name: string, tol: number = 0.01): void {
  if (Math.abs(a - b) < tol) {
    console.log(`Test success: ${name}`);
  } else {
    console.error(`Test failure: ${name}; |${a} - ${b}| < ${tol} is false`);
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

type Side2D = {
  left: Point,
  right: Point,
};

type Side = {
  left: number,
  right: number,
  height: number,
};

// Rotates 'point' by 'theta' around (0,0)
function rotatePoint(point: Point, theta: number): Point {
  return {
    x: point.x * Math.cos(theta) - point.y * Math.sin(theta),
    y: point.x * Math.sin(theta) + point.y * Math.cos(theta),
  };
}

function testRotatePoint() {
  {
    const p = { x: 10, y: 0 };
    const r1 = rotatePoint(p, Math.PI / 2);
    test(Math.abs(r1.x) < 0.01, `testRotatePoint1x: ${r1.x}`);
    test(Math.abs(r1.y - 10) < 0.01, `testRotatePoint1y: ${r1.y}`);
    const r2 = rotatePoint(p, Math.PI);
    test(Math.abs(r2.x + 10) < 0.01, `testRotatePoint2x: ${r2.x}`);
    test(Math.abs(r2.y) < 0.01, `testRotatePoint2y: ${r2.y}`);
  }
}

function getFacePoints(face: Face): Array<Point> {
  const dir: Direction = face.direction === 'none' ? 0 : face.direction;
  const result: Array<Point> = [];
  for (let i = 0; i < directions.length; i += 1) {
    const d = directions[(dir + i) % directions.length];
    result.push({
      x: face.center.x + face.size * Math.cos(d),
      y: face.center.y + face.size * Math.sin(d),
    });
  }
  return result;
}

function testGetFacePoints() {
  {
    const f = {
      ...defaultFace,
      center: { x: 0, y: 0 },
      size: 10,
    };
    const ps = getFacePoints(f);
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
    const f: Face = {
      ...defaultFace,
      center: { x: 0, y: 0 },
      size: 10,
      direction: 1,
    };
    const ps = getFacePoints(f);
    testEq(ps.length, 6, "gfp_b1");
    testAbs(ps[0].x, 10 * Math.cos(oneSixthCircle), "gfp_b2");
    testAbs(ps[0].y, 10 * Math.sin(oneSixthCircle), "gfp_b3");
  }
}

function branchStartFace(branch: Branch): Face {
  return {
    ...defaultFace,
    center: copyPoint(branch.start),
    size: branch.size,
    direction: branch.direction,
  };
}

function branchEndFace(branch: Branch): Face {
  return {
    ...defaultFace,
    center: addPoints(
      branch.start,
      {
        x: branch.length * Math.cos(directions[branch.direction]),
        y: branch.length * Math.sin(directions[branch.direction]),
      }),
    size: branch.size,
    direction: branch.direction,
  };
}

function getBranchPoints(branch: Branch): Array<Point> {
  const result: Array<Point> = [];
  const startPoints = getFacePoints(branchStartFace(branch));
  const endPoints = getFacePoints(branchEndFace(branch));
  result.push(endPoints[0]);
  result.push(endPoints[1]);
  result.push(startPoints[2]);
  result.push(startPoints[3]);
  result.push(startPoints[4]);
  result.push(endPoints[5]);
  return result;
}

function testGetBranchPoints() {
  {
    const b: Branch = {
      ...defaultBranch,
      start: { x: 0, y: 0 },
      direction: 0,
      length: 10,
      size: 1,
    };
    const p = getBranchPoints(b);
    testEq(p.length, 6, "gbp_a1");
    testAbs(p[0].x, 11, "gbp_a2");
    testAbs(p[0].y, 0, "gbp_a3");
    testAbs(p[5].x, 10 + Math.cos(5 * oneSixthCircle), "gbp_a4");
    testAbs(p[5].y, Math.sin(5 * oneSixthCircle), "gbp_a5");
  }
}

function getBranchSide2Ds(branch: Branch): Array<Side2D> {
  const points = getBranchPoints(branch);
  const result: Array<Side2D> = [];
  for (let i = 0; i < directions.length; i += 1) {
    if (i === directions.length - 1) {
      result.push({ right: points[i], left: points[0] });
    } else {
      result.push({ right: points[i], left: points[i + 1] });
    }
  }
  return result;
}

function testGetBranchSide2Ds() {
  {
    const b: Branch = {
      ...defaultBranch,
      start: { x: 0, y: 0 },
      size: 1,
      length: 10,
      direction: 2,
    };
    const p = getBranchSide2Ds(b);
    testEq(p.length, 6, "gbs_a1");
    testAbs(p[4].right.x, Math.cos(0 * oneSixthCircle), "gbs_a2");
    testAbs(p[4].right.y, Math.sin(0 * oneSixthCircle), "gbs_a3");
    testAbs(p[4].left.x,
            10 * Math.cos(2 * oneSixthCircle) + Math.cos(oneSixthCircle),
            "gbs_a4");
    testAbs(p[4].left.y,
            10 * Math.sin(2 * oneSixthCircle) + Math.sin(oneSixthCircle),
            "gbs_a5");
    testAbs(p[3].right.x, Math.cos(5 * oneSixthCircle), "gbs_a6");
    testAbs(p[3].right.y, Math.sin(5 * oneSixthCircle), "gbs_a7");
    testAbs(p[3].left.x, p[4].right.x, "gbs_a8");
    testAbs(p[3].left.y, p[4].right.y, "gbs_a9");
  }
}

function getNormalizedBranchSides(branch: Branch): Array<Side> {
  return getBranchSide2Ds(branch).map((s, i) => {
    const theta = oneSixthCircle * (1 - i);
    const left = rotatePoint(s.left, theta);
    const right = rotatePoint(s.right, theta);
    return {
      left: left.x,
      right: right.x,
      height: left.y,
    };
  });
}

function getFaceSide2Ds(face: Face): Array<Side2D> {
  const points = getFacePoints(face);
  const result: Array<Side2D> = [];
  for (let i = 0; i < directions.length; i += 1) {
    if (i === directions.length - 1) {
      result.push({ right: points[i], left: points[0] });
    } else {
      result.push({ right: points[i], left: points[i + 1] });
    }
  }
  return result;
}

function testGetFaceSide2Ds() {
  {
     const f = {
      ...defaultFace,
      center: { x: 0, y: 0 },
      size: 10,
    };
    const s = getFaceSide2Ds(f);
    const p = getFacePoints(f);
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
function getNormalizedFaceSides(face: Face): Array<Side> {
  return getFaceSide2Ds(face).map((s, i) => {
    const theta = oneSixthCircle * (1 - i);
    const left = rotatePoint(s.left, theta);
    const right = rotatePoint(s.right, theta);
    return {
      left: left.x,
      right: right.x,
      height: left.y,
    };
  });
}

function testGetNormalizedFaceSides() {
  {
    const f: Face = {
      ...defaultFace,
      size: 10,
      direction: 0,
      center: { x: 0, y: 0 },
    };
    const s = getNormalizedFaceSides(f);
    const left = 10 * Math.cos(2 * oneSixthCircle);
    const right = 10 * Math.cos(oneSixthCircle);
    const height = 10 * Math.sin(oneSixthCircle);
    for (let t = 0; t < 6; t += 1) {
      testAbs(s[t].left, left, `norm_a${t}_left`);
      testAbs(s[t].right, right, `norm_a${t}_right`);
      testAbs(s[t].height, height, `norm_a${t}_height`);
    }
  }
  {
    const s: Array<[Array<Side2D>, Array<Side>]> = directions.map((d, i) => {
      if (isDirection(i)) {
        const f: Face = {
          ...defaultFace,
          size: 10,
          direction: i,
          center: rotatePoint({ x: 50, y: 0 }, d),
        };
        return [getFaceSide2Ds(f), getNormalizedFaceSides(f)];
      } else {
        console.error('problem in norm');
        return [getFaceSide2Ds(defaultFace), getNormalizedFaceSides(defaultFace)];
      }
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

const enableTests = true;
if (enableTests) {
  testFindCircleRayIntersection();
  testDelete();
  testRotatePoint();
  testGetFacePoints();
  testGetFaceSide2Ds();
  testGetNormalizedFaceSides();
  testGetBranchPoints();
  testGetBranchSide2Ds();
}

type State = {
  graph: Graph,
  graphic: Graphic,
  snowflake: Snowflake,
  currentGrowthType: GrowthType | undefined,
  graphMargin: number,
  writableGraphWidth: number,
  writableGraphHeight: number,
  controls: Controls,
  step: number,
  intervalId: undefined | number,
  updateInterval: number,
  maxSteps: number,
};

function makeState(): State | undefined {
  const graph = makeGraph();
  const graphic = makeGraphic();
  if (graph === undefined || graphic === undefined) {
    console.error("Couldn't get drawing context");
    return undefined;
  }
  const snowflake = createInitialSnowflake();
  const currentGrowthType = undefined;
  const graphMargin = 10;
  const writableGraphWidth = graph.canvas.width - 2 * graphMargin;
  const writableGraphHeight = graph.canvas.height;
  const controls = makeControls(graphic);
  const step = 0;
  const intervalId = undefined;
  const updateInterval = 5;
  const maxSteps = 6000;
  return {
    graph,
    graphic,
    snowflake,
    currentGrowthType,
    graphMargin,
    writableGraphWidth,
    writableGraphHeight,
    controls,
    step,
    intervalId,
    updateInterval,
    maxSteps,
  };
}

function resetSnowflake(state: State): void {
  state.snowflake = createInitialSnowflake();
  state.step = 0;
  state.currentGrowthType = undefined;
  clearSnowflakeCanvas(state.graphic);
}

(() => {
  const state = makeState();
  if (state === undefined) {
    return;
  }
  registerControlsEventListeners(state);
  state.intervalId = window.setInterval(
    () => update(state),
    state.updateInterval);
})();
