import { Face } from "./Face";
import * as Faces from "./Face";
import { Branch } from "./Branch";
import * as Branches from "./Branch";
import { Graphic } from "./Graphic";
import { Direction, DIRS } from "./Direction";
import * as Directions from "./Direction";
import { Array6, makeArray6, rem } from "./Utils";
import { Side } from "./Side";
import * as Sides from "./Side";
import * as Points from "./Point";
import { Side2D } from "./Side2D";
import { Point } from "./Point";

const MAX_FACES: number = 10000;
const MAX_BRANCHES: number = 10000;
type CacheIndex = 0 | 1;
const FACE_CACHE: CacheIndex = 0;
const BRANCH_CACHE: CacheIndex = 1;
type SideCache =  [Array6<Array<Side>>, Array6<Array<Side>>];

export type Snowflake = {
  faces: Array<Face>,
  branches: Array<Branch>,
  numFaces: number,
  numBranches: number,
  sideCaches: SideCache,
  numInitialGrownFaces: number,
  numInitialGrownBranches: number,
};

export function addFaceM(
  snowflake: Snowflake,
  centerX: number,
  centerY: number,
  size: number,
  isFirstFace: boolean,
  direction: Direction,
  growthScale: number,
  growing: boolean
): number {
  const index = snowflake.numFaces;
  if (snowflake.faces[index] === undefined) {
    snowflake.faces[index] = {
      center: { x: centerX, y: centerY },
      size,
      isFirstFace,
      direction,
      growthScale,
      growing
    };
  } else {
    const f = snowflake.faces[index];
    f.center.x = centerX;
    f.center.y = centerY;
    f.size = size;
    f.isFirstFace = isFirstFace;
    f.direction = direction;
    f.growthScale = growthScale;
    f.growing = growing;
  }
  snowflake.numFaces += 1;
  return index;
}

export function addBranchM(
  snowflake: Snowflake,
  startX: number,
  startY: number,
  size: number,
  length: number,
  direction: Direction,
  growthScale: number,
  growing: boolean,
): number {
  const index = snowflake.numBranches;
  if (snowflake.branches[index] === undefined) {
    snowflake.branches[index] = {
      start: { x: startX, y: startY },
      size,
      length,
      direction,
      growthScale,
      growing
    };
  } else {
    const b = snowflake.branches[index];
    b.start.x = startX;
    b.start.y = startY;
    b.size = size;
    b.length = length;
    b.direction = direction;
    b.growthScale = growthScale;
    b.growing = growing;
  }
  snowflake.numBranches += 1;
  return index;
}

export function forEachFace(snowflake: Snowflake, f: (face: Face, index: number) => void): void {
  for (let i = 0; i < snowflake.numFaces; ++i) {
    f(snowflake.faces[i], i);
  }
}

export function forEachBranch(snowflake: Snowflake, f: (branch: Branch, index: number) => void): void {
  for (let i = 0; i < snowflake.numBranches; ++i) {
    f(snowflake.branches[i], i);
  }
}

const oneZeroArray: [1, 0] = [1, 0];

export function forEachGrowingFace(snowflake: Snowflake, f: (face: Face, index: number) => void): void {
  for (let i = snowflake.numInitialGrownFaces; i < snowflake.numFaces; ++i) {
    const face = snowflake.faces[i];
    if (!face.growing) {
      snowflake.numInitialGrownFaces += oneZeroArray[Math.min(1, i - snowflake.numInitialGrownFaces)];
      continue;
    }
    f(snowflake.faces[i], i);
  }
}

export function forEachGrowingBranch(snowflake: Snowflake, f: (branch: Branch, index: number) => void): void {
  for (let i = snowflake.numInitialGrownBranches; i < snowflake.numBranches; ++i) {
    const branch = snowflake.branches[i];
    if (!branch.growing) {
      snowflake.numInitialGrownBranches += oneZeroArray[Math.min(1, i - snowflake.numInitialGrownBranches)];
      continue;
    }
    f(snowflake.branches[i], i);
  }
}

export function draw(graphic: Graphic, snowflake: Snowflake): boolean {
  let anyPartOutside = false;
  graphic.ctx.strokeStyle = `rgba(255, 255, 255, 0.08)`;
  graphic.ctx.beginPath();
  forEachGrowingFace(snowflake, (f, _) => anyPartOutside ||= Faces.draw(graphic, f));
  forEachGrowingBranch(snowflake, (b, _) => anyPartOutside ||= Branches.draw(graphic, b));
  graphic.ctx.stroke();
  return anyPartOutside;
}

function zeroParts<P>(maxParts: number, zeroPart: () => P, caches: SideCache, cacheIndex: CacheIndex): Array<P> {
  const result = [];
  for (let i = 0; i < maxParts; ++i) {
    result[i] = zeroPart();
    for (let j = 0; j < DIRS; ++j) {
      caches[cacheIndex][j][i] = Sides.zero();
    }
  }
  return result;
}

export function zero(): Snowflake {
  const sideCaches: [Array6<Array<Side>>, Array6<Array<Side>>] = [makeArray6(() => []), makeArray6(() => [])];
  const faces = zeroParts(MAX_FACES, Faces.zero, sideCaches, FACE_CACHE);
  const branches = zeroParts(MAX_BRANCHES, Branches.zero, sideCaches, BRANCH_CACHE);
  return {
    faces,
    branches,
    numFaces: 1,
    numBranches: 0,
    sideCaches,
    numInitialGrownFaces: 0,
    numInitialGrownBranches: 0,
  }
}

export function zeroM(s: Snowflake): void {
  s.numFaces = 1;
  Faces.zeroM(s.faces[0])
  s.numBranches = 0;
  s.numInitialGrownFaces = 0;
  s.numInitialGrownBranches = 0;
}

const branchSplittingGrowthScales = [0.7, 1, 0.7];

function addBranchesToFace(snowflake: Snowflake, face: Face): void {
  const initialFraction = 0.01;
  const sizeOfNewBranches = face.size * initialFraction;

  // This is the offset from the edge of the face that we add to the start of the branch
  // so that it does not overlap the face itself when it is first created. Without this,
  // overlap detection immediatelly kills freshly created branches.
  const safetyOffset = 0.001;

  const distFromCenter = safetyOffset + 1 * face.size * (1 - initialFraction);
  const cx = face.center.x;
  const cy = face.center.y;

  if (face.isFirstFace) {
    const growthScale = branchSplittingGrowthScales[1];
    for (let i = 0; i < 6; ++i) {
      addBranchM(
        snowflake,
        cx + distFromCenter * Directions.cosines[i],
        cy + distFromCenter * Directions.sines[i],
        sizeOfNewBranches,
        0,
        i as Direction,
        growthScale,
        true
      );
    }
  } else {
    for (let k = -1; k < 2; ++k) {
      const growthScale = face.growthScale * branchSplittingGrowthScales[k + 1];
      const i = rem(face.direction + k, 6);
      addBranchM(
        snowflake,
        cx + distFromCenter * Directions.cosines[i],
        cy + distFromCenter * Directions.sines[i],
        sizeOfNewBranches,
        0,
        i as Direction,
        growthScale,
        true
      );
    }
  }
}

export function addBranchesToGrowingFaces(snowflake: Snowflake): void {
  forEachGrowingFace(snowflake, (face, _) => {
    addBranchesToFace(snowflake, face);
    face.growing = false;
  })
}

function addFaceToBranch(snowflake: Snowflake, branch: Branch): void {
  addFaceM(
    snowflake,
    Branches.endCenterX(branch),
    Branches.endCenterY(branch),
    branch.size,
    false,
    branch.direction,
    branch.growthScale,
    true
  );
}

export function addFacesToGrowingBranches(snowflake: Snowflake): void {
  forEachGrowingBranch(snowflake, (branch, _) => {
    addFaceToBranch(snowflake, branch);
    branch.growing = false;
  });
}

export function cacheNormalizedSides(snowflake: Snowflake) {
  forEachGrowingFace(snowflake, (f, fi) => {
    for (let i = 0; i < Directions.values.length; ++i) {
      if (snowflake.sideCaches[0][i][fi] !== undefined) {
        break;
      }
      snowflake.sideCaches[0][i][fi] = Sides.zero();
    }
    Sides.normalizeFaceRelativeSide2DsM(snowflake.sideCaches[0], fi, f);
  });
  forEachGrowingBranch(snowflake, (b, bi) => {
    for (let i = 0; i < Directions.values.length; ++i) {
      if (snowflake.sideCaches[1][i][bi] !== undefined) {
        break;
      }
      snowflake.sideCaches[1][i][bi] = Sides.zero();
    }
    Sides.normalizeBranchRelativeSide2DsM(snowflake.sideCaches[1], bi, b);
  });
}

type Killable = {
  direction: Direction,
  growing: boolean,
};

export function killPartIfCoveredInOneDirection(
  part: Killable,
  partIndex: number,
  side: Side,
  otherSides: Array<Side>,
  numOtherSides: number,
  otherSidesContainsPartSides: boolean,
): void {
  for (let oi = 0; oi < numOtherSides; ++oi) {
    if (otherSidesContainsPartSides && oi === partIndex) {
      continue;
    }
    const otherLeftSide = otherSides[oi];
    const distance = Sides.overlaps(otherLeftSide, side);
    if (distance !== undefined) {
      part.growing = false;
      break;
    }
  }
}

export function killPartIfCoveredInOneOfTwoDirections(
  caches: [Array6<Array<Side>>, Array6<Array<Side>>],
  cacheLengths: [number, number],
  leftSide: Side,
  rightSide: Side,
  left: Direction,
  right: Direction,
  part: Killable,
  partIndex: number,
): void {
  for (let ci = 0; ci < caches.length; ++ci) {
    const cache = caches[ci];
    const otherLeftSides = cache[left];
    const otherRightSides = cache[right];
    const inFaceCache = ci === 0;
    killPartIfCoveredInOneDirection(part, partIndex, leftSide, otherLeftSides, cacheLengths[ci], inFaceCache);
    if (!part.growing) {
      return;
    }
    killPartIfCoveredInOneDirection(part, partIndex, rightSide, otherRightSides, cacheLengths[ci], inFaceCache);
    if (!part.growing) {
      return;
    }
  }
}

export function killPartIfCovered(
  part: Killable,
  partIndex: number,
  caches: [Array6<Array<Side>>, Array6<Array<Side>>],
  cacheLengths: [number, number],
  partCacheIndex: 0 | 1,
): void {
  const d = part.direction;
  const leftDirection = d;
  const rightDirection = rem(d - 1, Directions.values.length) as Direction;
  const leftSide = caches[partCacheIndex][leftDirection][partIndex];
  const rightSide = caches[partCacheIndex][rightDirection][partIndex];
  killPartIfCoveredInOneOfTwoDirections(caches, cacheLengths, leftSide, rightSide, leftDirection, rightDirection, part, partIndex);
}

export function killCoveredFaces(snowflake: Snowflake): void {
  forEachGrowingFace(snowflake, (f, fi) => {
    killPartIfCovered(f, fi, snowflake.sideCaches, [snowflake.numFaces, snowflake.numBranches], 0);
  });
}

export function killCoveredBranches(snowflake: Snowflake): void {
  forEachGrowingBranch(snowflake, (b, bi) => {
    killPartIfCovered(b, bi, snowflake.sideCaches, [snowflake.numFaces, snowflake.numBranches], 1);
  });
}