import { Graphic } from "./Graphic";

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
  graphMouse: undefined | Point,
  background: RGBA,
};

function makeGraph(): Graph | undefined {
  const canvas = document.getElementById('graph') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d');

  if (ctx === null) {
    return undefined;
  }

  const graphMouse = undefined;
  const background: RGBA = `rgba(203, 203, 255, 1)`;
  const result: Graph = {
    canvas,
    ctx,
    handleBeingDragged: undefined,
    mouseRecentlyExitedGraph: false,
    graphMouse,
    background,
  };

  canvas.addEventListener('mousemove', e => {
    result.graphMouse = { x: e.offsetX, y: e.offsetY };
  });
  canvas.addEventListener('mousedown', e => {
    result.handleBeingDragged = 'needs lookup';
  });
  document.addEventListener('mouseup', e => {
    result.handleBeingDragged = undefined;
    result.graphMouse = undefined;
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
  center: Point,
  size: number,
  direction: Direction | 'none',
  growthScale: number,
  id: number,
};

const defaultPoint: Point = { x: 0, y: 0 };

const defaultFace: Face = {
  center: defaultPoint,
  size: 0.0025,
  direction: 'none',
  growthScale: 1,
  id: 0,
};

type Branch = {
  rayHits: number,
  start: Point,
  size: number,
  length: number,
  direction: Direction,
  growthScale: number,
  id: number,
}

const defaultBranch: Branch = {
  rayHits: 0,
  start: defaultPoint,
  size: 0.0025,
  length: 0.005,
  direction: 0,
  growthScale: 1,
  id: 0,
};

function branchEnd(branch: Branch): Point {
  let d = directions[branch.direction];
  let l = branch.length;
  let x = branch.start.x + l * Math.cos(d);
  let y = branch.start.y + l * Math.sin(d);
  return { x, y };
}

function drawSnowflake(graphic: Graphic, snowflake: Snowflake): void {
  snowflake.faces.growing.forEach(f => {
    drawFace(graphic, f)
    // getNormalizedFaceSides(f).forEach((s, i) => {
    //   drawSide(graphic, s, i, f);
    // });
  });
  snowflake.faces.grown.forEach(f => drawFace(graphic, f));
  snowflake.branches.growing.forEach(b => {
    drawBranch(graphic, b);
    // getNormalizedBranchSides(b).forEach((s, i) => {
    //   drawSide(graphic, s, i, defaultFace);
    // });
  });
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

function drawSide(graphic: Graphic, side: Side, index: number, face: Face): void {
  // if (index !== 4) {
  //   return;
  // }
  graphic.ctx.beginPath();
  //  const h = 1/6 * (index + 1);
  const h = side.height;
  const left = worldToViewTransform(graphic, { x: side.left, y: h });
  const right = worldToViewTransform(graphic, { x: side.right, y: h });
  graphic.ctx.moveTo(left.x, left.y);
  graphic.ctx.lineTo(right.x, right.y);
  const oldWidth = graphic.ctx.lineWidth;
  graphic.ctx.lineWidth = 10;
  graphic.ctx.strokeStyle = `rgba(${255 / 6 * (index + 1)}, 0, 255, 0.2)`;
  graphic.ctx.stroke();
  graphic.ctx.lineWidth = oldWidth;
}

function drawNormalization(graphic: Graphic, side2d: Side2D, absoluteDirection: number): void {
  if (absoluteDirection !== 0)
    return;

  const oldWidth = graphic.ctx.lineWidth;
  const oldStyle = graphic.ctx.strokeStyle;

  // // draw the side2d
  // {
  //   const left = worldToViewTransform(graphic, side2d.left);
  //   const right = worldToViewTransform(graphic, side2d.right);
  //   graphic.ctx.beginPath();
  //   graphic.ctx.moveTo(left.x, left.y);
  //   graphic.ctx.lineTo(right.x, right.y);
  //   graphic.ctx.lineWidth = 10;
  //   graphic.ctx.strokeStyle = `rgba(0, 0, 255, 0.2)`;
  //   graphic.ctx.stroke();
  // }

  // draw the side
  const side = normalizeSide2D(side2d, absoluteDirection);
  const left = worldToViewTransform(graphic, { x: side.left, y: side.height });
  const right = worldToViewTransform(graphic, { x: side.right, y: side.height });
  graphic.ctx.beginPath();
  graphic.ctx.moveTo(left.x, left.y);
  graphic.ctx.lineTo(right.x, right.y);
  graphic.ctx.lineWidth = 10;
  graphic.ctx.strokeStyle = `rgba(203, 203, 255, 1)`;
  graphic.ctx.stroke();

  // draw the line
  const middle2d = worldToViewTransform(graphic, {
    x: 0.5 * (side2d.left.x + side2d.right.x),
    y: 0.5 * (side2d.left.y + side2d.right.y),
  });
  const middle = worldToViewTransform(graphic, {
    x: 0.5 * (side.left + side.right),
    y: side.height,
  });
  graphic.ctx.beginPath();
  graphic.ctx.moveTo(middle2d.x, middle2d.y);
  graphic.ctx.lineTo(middle.x, middle.y);
  graphic.ctx.lineWidth = 1
  graphic.ctx.strokeStyle = 'rgba(0, 0, 0, 1)';
  graphic.ctx.stroke();

  // cleanup
  graphic.ctx.lineWidth = oldWidth;
  graphic.ctx.strokeStyle = oldStyle;
}

function drawFace(graphic: Graphic, face: Face): void {
  const dir = face.direction === "none" ? 0 : face.direction;
  // getFaceSide2Ds(face).forEach((side2d, i) => {
  //   drawNormalization(graphic, side2d, (i + dir) % directions.length);
  // });
  //   getNormalizedFaceSides(face).forEach((side, i) => {
  //     const dir = face.direction === "none" ? 0 : face.direction;
  // //    if ((i + dir) % directions.length === 0) {
  //     drawSide(graphic, side, (i + dir) % directions.length, face);
  //   });
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
  graphic.ctx.fillStyle = `rgba(203, 203, 255, 1)`;
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
        center: { x: 0, y: 0 },
        size: 0.0025,
        direction: 'none',
        growthScale: 1,
        id: 0,
      }],
      grown: [],
      waiting: [],
    },
    branches: { growing: [], grown: [], waiting: [] },
  };
}

const growthScalar = 0.001;
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

      //const randomAdjust = Math.random() * 0.5 + 0.5;
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
      id: getId(snowflake),
    });
    dir = nextDirection(dir);
  }
}

function getId(snowflake: Snowflake): number {
  return snowflake.faces.waiting.length + snowflake.faces.grown.length
    + snowflake.branches.growing.length + snowflake.branches.grown.length;
}

function addFaceToBranch(snowflake: Snowflake, branch: Branch): void {
  snowflake.faces.growing.push({
    center: branchEnd(branch),
    size: branch.size,
    direction: branch.direction,
    growthScale: branch.growthScale,
    id: getId(snowflake),
  });
}

type NonEmptyArray<T> = { 0: T } & Array<T>;
type GrowthFunction = (time: number) => Growth;
type Growth = { scale: number, growthType: GrowthType };
type GrowthType = 'branching' | 'faceting';

function clamp(x: number, low: number, high: number): number {
  return Math.min(Math.max(x, low), high);
}

function createRandomGrowthInput(): NonEmptyArray<number> {
  let result: NonEmptyArray<number> = [0];
  for (let i = 0; i < 16; i++) {
    result[i] = Math.floor(Math.random() * 9);
  }
  return result;
}

let growthInput: NonEmptyArray<number> = createRandomGrowthInput();
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
  i: number): Point {
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

  for (let i = 0; i < growthInput.length; i += 1) {
    const p = growthHandlePosition(
      writableGraphWidth,
      writableGraphHeight,
      graphMargin,
      i);
    if (graph.graphMouse !== undefined) {
      const nearest = nearestGrowthHandle(state, graph.graphMouse);
      drawGraphHandle(graph, p.x, p.y, i === nearest, i === graph.handleBeingDragged);
    } else {
      drawGraphHandle(graph, p.x, p.y, false, false);
    }
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

function squareDistance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return dx * dx + dy * dy;
}

function distance(p1: Point, p2: Point): number {
  return Math.sqrt(squareDistance(p1, p2));
}

type Circle = {
  center: Point,
  radius: number,
};

function currentTime(state: State): number {
  const { step, maxSteps } = state;
  return step / maxSteps;
}

function updateGraph(state: State): void {
  const { graph, writableGraphHeight } = state;
  if (graph.handleBeingDragged !== undefined || graph.mouseRecentlyExitedGraph) {
    graph.mouseRecentlyExitedGraph = false;
    const handle: undefined | number | 'needs lookup' = (() => {
      if (graph.handleBeingDragged === 'needs lookup' && graph.graphMouse !== undefined) {
        return nearestGrowthHandle(state, graph.graphMouse);
      } else {
        return graph.handleBeingDragged;
      }
    })();

    if (graph.handleBeingDragged === 'needs lookup') {
      graph.handleBeingDragged = handle;
    }

    if (graph.graphMouse !== undefined && handle !== 'needs lookup') {
      const dy = writableGraphHeight / yChoices.length;
      const i = Math.floor(graph.graphMouse.y / dy);
      if (handle !== undefined) {
        growthInput[handle] = clamp(i, 0, yChoices.length - 1);
      }
    }
  }

  let beingDragged = graph.handleBeingDragged !== undefined;
  let userSelectValue = beingDragged ? 'none' : 'auto';
  let setStyle = (e: Element) => e.setAttribute('style', `user-select: ${userSelectValue}`);
  Array.from(document.getElementsByClassName('graphLabel')).forEach(setStyle);
  Array.from(document.getElementsByClassName('control')).forEach(setStyle);
  let controlContainer = document.getElementById('controlContainer');
  if (controlContainer !== null) {
    setStyle(controlContainer);
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
  // snowflake.faces.waiting.splice(
  //   snowflake.faces.waiting.length,
  //   0,
  //   ...coveredGrowingFaces(snowflake.faces.growing, snowflake.faces.grown)
  // );
  // snowflake.branches.waiting.splice(
  //   snowflake.branches.waiting.length,
  //   0,
  //   ...coveredGrowingBranches(snowflake.branches.growing, snowflake.branches.grown)
  // );

  const compareFace = (f1: Face, f2: Face) => f1.id - f2.id;
  const compareBranch = (b1: Branch, b2: Branch) => b1.id - b2.id;
  snowflake.faces.growing.sort(compareFace);
  snowflake.faces.grown.sort(compareFace);
  snowflake.faces.waiting.sort(compareFace);
  snowflake.branches.growing.sort(compareBranch);
  snowflake.branches.grown.sort(compareBranch);
  snowflake.branches.waiting.sort(compareBranch);

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

type Side2D = {
  left: Point,
  right: Point,
};

type Side = {
  left: number,
  right: number,
  height: number,
};

type SideFace = {
  side: Side,
  face: Face,
  growing: boolean,
};

type SideBranch = {
  side: Side,
  branch: Branch,
  growing: boolean,
};

// Returns a side at the same hight as `side` but scaled by `scale`
// (scale=1 returns the same side, scale=2 returns twice side, etc.).
function biggerSide(side: Side, scale: number): Side {
  return {
    left: side.left * scale,
    right: side.right * scale,
    height: side.height,
  };
}

// Rotates 'point' by 'theta' around (0,0)
function rotatePoint(point: Point, theta: number): Point {
  return {
    x: point.x * Math.cos(theta) - point.y * Math.sin(theta),
    y: point.x * Math.sin(theta) + point.y * Math.cos(theta),
  };
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

// Returns a Side calculated by rotating 'side2d' around the origin
// until it is horizontal. 'absoluteDirection' should be the
// non-relative number of the side, starting from the rightmost upward
// side and going counterclockwise.
function normalizeSide2D(side2d: Side2D, absoluteDirection: number): Side {
  const theta = oneSixthCircle * (1 - absoluteDirection);
  const left = rotatePoint(side2d.left, theta);
  const right = rotatePoint(side2d.right, theta);
  return {
    left: left.x,
    right: right.x,
    height: left.y,
  };
}

// Returns an array of sides of the face but where every side is
// rotated around the origin so that it is horizontal. The sides are
// returned in counterclockwise order starting with the side touching
// the vertex in the face's direction and going counterclockwise away
// from it.
function getNormalizedFaceSides(face: Face): Array<Side> {
  const dir = face.direction === "none" ? 0 : face.direction;
  return getFaceSide2Ds(face).map((s, i) => {
    return normalizeSide2D(s, (i + dir) % directions.length);
  });
}

type Array6XSideFace = [
  Array<SideFace>,
  Array<SideFace>,
  Array<SideFace>,
  Array<SideFace>,
  Array<SideFace>,
  Array<SideFace>
];

type Array6XSideBranch = [
  Array<SideBranch>,
  Array<SideBranch>,
  Array<SideBranch>,
  Array<SideBranch>,
  Array<SideBranch>,
  Array<SideBranch>
];

// const stopDistance = 0.001;
// const slowdownMultiplier = 0.999;
// const sideScale = 1.15;

// function coveredGrowingBranches(growingBranches: Array<Branch>, grownBranches: Array<Branch>): Array<Branch> {
//   const result: Array<Branch> = [];

//   const normalizedSideBranches: Array6XSideBranch = [[], [], [], [], [], []];
//   growingBranches.forEach(branch => {
//     getNormalizedBranchSides(branch).forEach((side, i) => {
//       let dir = branch.direction;
//       normalizedSideBranches[(i + dir) % directions.length].push({ side, branch, growing: true });
//     });
//   });
//   grownBranches.forEach(branch => {
//     getNormalizedBranchSides(branch).forEach((side, i) => {
//       let dir = branch.direction;
//       normalizedSideBranches[(i + dir) % directions.length].push({ side, branch, growing: false });
//     });
//   });

//   growingBranches.forEach(branch => {
//     let dir = branch.direction;
//     const normalizedSides = getNormalizedBranchSides(branch);
//     const leftSide = normalizedSides[0];
//     const leftAbsoluteDir = dir;
//     const rightSide = normalizedSides[directions.length - 1];
//     const rightAbsoluteDir = (directions.length - 1 + dir) % directions.length;
//     let coveredCount = 0;
//     for (let i = 0; i < normalizedSideBranches[leftAbsoluteDir].length; i += 1) {
//       const sideBranch = normalizedSideBranches[leftAbsoluteDir][i];
//       const overlap = overlaps(biggerSide(sideBranch.side, sideScale), leftSide);
//       if (overlap !== undefined && overlap < stopDistance) {
//         coveredCount += 1;
//         break;
//       } else if (overlap !== undefined) {
//         // branch.growthScale *= slowdownMultiplier;
//       }
//     }
//     for (let i = 0; i < normalizedSideBranches[rightAbsoluteDir].length; i += 1) {
//       const sideBranch = normalizedSideBranches[rightAbsoluteDir][i];
//       const overlap = overlaps(biggerSide(sideBranch.side, sideScale), rightSide);
//       if (overlap !== undefined && overlap < stopDistance) {
//         coveredCount += 1;
//         break;
//       } else if (overlap !== undefined) {
//         // branch.growthScale *= slowdownMultiplier;
//       }
//     }
//     if (coveredCount === 2) {
//       result.push(branch);
//     }
//   });

//   return result;
// }

// function coveredGrowingFaces(growingFaces: Array<Face>, grownFaces: Array<Face>): Array<Face> {
//   const result: Array<Face> = [];

//   const normalizedSideFaces: Array6XSideFace = [[], [], [], [], [], []];
//   growingFaces.forEach(face => {
//     getNormalizedFaceSides(face).forEach((side, i) => {
//       let dir = face.direction === "none" ? 0 : face.direction;
//       normalizedSideFaces[(i + dir) % directions.length].push({ side, face, growing: true });
//     });
//   });
//   grownFaces.forEach(face => {
//     getNormalizedFaceSides(face).forEach((side, i) => {
//       let dir = face.direction === "none" ? 0 : face.direction;
//       normalizedSideFaces[(i + dir) % directions.length].push({ side, face, growing: false });
//     });
//   });

//   growingFaces.forEach(face => {
//     let dir = face.direction === "none" ? 0 : face.direction;
//     const normalizedSides = getNormalizedFaceSides(face);
//     const leftSide = normalizedSides[0];
//     const leftAbsoluteDir = dir;
//     const rightSide = normalizedSides[directions.length - 1];
//     const rightAbsoluteDir = (directions.length - 1 + dir) % directions.length;
//     let coveredCount = 0;
//     for (let i = 0; i < normalizedSideFaces[leftAbsoluteDir].length; i += 1) {
//       const sideFace = normalizedSideFaces[leftAbsoluteDir][i];
//       const overlap = overlaps(biggerSide(sideFace.side, sideScale), leftSide);
//       if (overlap !== undefined && overlap < stopDistance) {
//         coveredCount += 1;
//         break;
//       } else if (overlap !== undefined) {
//         face.growthScale *= slowdownMultiplier;
//       }
//     }
//     for (let i = 0; i < normalizedSideFaces[rightAbsoluteDir].length; i += 1) {
//       const sideFace = normalizedSideFaces[rightAbsoluteDir][i];
//       const overlap = overlaps(biggerSide(sideFace.side, sideScale), rightSide)
//       if (overlap !== undefined && overlap < stopDistance) {
//         coveredCount += 1;
//         break;
//       } else if (overlap !== undefined) {
//         face.growthScale *= slowdownMultiplier;
//       }
//     }
//     if (coveredCount === 2) {
//       result.push(face);
//     }
//   });

//   return result;
// }

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
  const maxSteps = 1000;
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

// Returns how far above s1 is from s2 if s1 is above and overlapping
// s2, otherwise returns undefined.
function overlaps(s1: Side, s2: Side): number | undefined {
  if (s1.height > s2.height &&
    (s1.left < s2.left && s1.right > s2.left ||
      s1.left > s2.left && s2.right > s1.left ||
      s1.left < s2.left && s1.right > s2.right ||
      s1.left > s2.left && s1.right < s2.right)) {
    return s1.height - s2.height;
  }

  return undefined;
}

type Section<P> = {
  side: Side,
  part: P,
};

// function waitingFaces(faces: Array<Face>, direction: Direction): Array<Face> {
//   const sections: Array<Section<Face>> = [];
//   faces.forEach(part => {
//     getNormalizedFaceSides(part).forEach(side => {
//       sections.push({ side, part });
//     });
//   });
//   sections.sort((a, b) => a.side.height - b.side.height);
//   const top: Array<Section<Face>> = [];
//   const waitingFaces: Array<Face> = [];
//   sections.forEach(s => {
//     const overlappedSections: Array<Section<Face>> = insertSectionIntoTop(s, top);
//     overlappedSections.forEach(o => waitingFaces.push(o.part));
//   });
//   return []; // fixme
// }

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

// function install(parent: HTMLElement): void {

// }