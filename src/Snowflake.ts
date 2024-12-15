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
type CacheIndex = 0 | 1 | 2 | 3 | 4 | 5;
const NUM_SIDE_ELEMENTS = 3;
const FACE_CACHES: CacheIndex = 0;
const FACE_LEFT_CACHE: CacheIndex = 0;
const FACE_RIGHT_CACHE: CacheIndex = 1;
const FACE_HEIGHT_CACHE: CacheIndex = 2;
const BRANCH_CACHES: CacheIndex = 3;
const BRANCH_LEFT_CACHE: CacheIndex = 3;
const BRANCH_RIGHT_CACHE: CacheIndex = 4;
const BRANCH_HEIGHT_CACHE: CacheIndex = 5;
type SideCache = [
  Array6<Array<number>>,
  Array6<Array<number>>,
  Array6<Array<number>>,
  Array6<Array<number>>,
  Array6<Array<number>>,
  Array6<Array<number>>,
];
const JS_ENGINE_MAKE_THIS_AN_ARRAY_OF_DOUBLES_PLEASE_AND_THANK_YOU: number = 0;

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
): boolean {
  if (snowflake.numFaces < MAX_FACES) {
    const f = snowflake.faces[snowflake.numFaces];
    f.center.x = centerX;
    f.center.y = centerY;
    f.size = size;
    f.isFirstFace = isFirstFace;
    f.direction = direction;
    f.growthScale = growthScale;
    f.growing = growing;
    snowflake.numFaces += 1;
    return false;
  }
  return true;
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
): boolean {
  if (snowflake.numBranches < MAX_BRANCHES) {
    const b = snowflake.branches[snowflake.numBranches];
    b.start.x = startX;
    b.start.y = startY;
    b.size = size;
    b.length = length;
    b.direction = direction;
    b.growthScale = growthScale;
    b.growing = growing;
    snowflake.numBranches += 1;
    return false;
  }
  return true;
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
      for (let s = 0; s < NUM_SIDE_ELEMENTS; ++s) {
        caches[cacheIndex + s][j][i] = JS_ENGINE_MAKE_THIS_AN_ARRAY_OF_DOUBLES_PLEASE_AND_THANK_YOU;
      }
    }
  }
  return result;
}

export function zero(): Snowflake {
  const sideCaches: SideCache = [
    makeArray6(() => []),
    makeArray6(() => []),
    makeArray6(() => []),
    makeArray6(() => []),
    makeArray6(() => []),
    makeArray6(() => []),
  ];
  const faces = zeroParts(MAX_FACES, Faces.zero, sideCaches, FACE_CACHES);
  const branches = zeroParts(MAX_BRANCHES, Branches.zero, sideCaches, BRANCH_CACHES);
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

const branchSplittingGrowthScales = [0.5, 0.9, 0.5];

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
    Sides.normalizeFaceRelativeSide2DsM(
      snowflake.sideCaches[FACE_LEFT_CACHE],
      snowflake.sideCaches[FACE_RIGHT_CACHE],
      snowflake.sideCaches[FACE_HEIGHT_CACHE],
      fi,
      f
    );
  });
  forEachGrowingBranch(snowflake, (b, bi) => {
    Sides.normalizeBranchRelativeSide2DsM(
      snowflake.sideCaches[BRANCH_LEFT_CACHE],
      snowflake.sideCaches[BRANCH_RIGHT_CACHE],
      snowflake.sideCaches[BRANCH_HEIGHT_CACHE],
      bi,
      b
    );
  });
}

type Killable = {
  direction: Direction,
  growing: boolean,
};

export function killPartIfCoveredInOneDirection(
  part: Killable,
  partIndex: number,
  sideLeftCache: Array<number>,
  sideRightCache: Array<number>,
  sideHeightCache: Array<number>,
  otherLeftSideCache: Array<number>,
  otherRightSideCache: Array<number>,
  otherHeightSideCache: Array<number>,
  numOtherSides: number,
  otherCacheContainsPart: boolean,
): void {
  const sl = sideLeftCache[partIndex];
  const sr = sideRightCache[partIndex];
  for (let oi = 0; oi < numOtherSides && part.growing; ++oi) {
    const ol = otherLeftSideCache[oi];
    const or = otherRightSideCache[oi];
    const overlaps = Sides.overlapsRaw(ol, or, sl, sr);
    if (overlaps
      && Sides.overlapDistanceRaw(otherHeightSideCache[oi], sideHeightCache[partIndex]) > 0
      && !(otherCacheContainsPart && oi === partIndex)
    ) {
      part.growing = false;
      break;
    }
  }
}

export function killPartIfCoveredInOneOfTwoDirections(
  caches: SideCache,
  numFaces: number,
  numBranches: number,
  left: Direction,
  right: Direction,
  part: Killable,
  partIndex: number,
  partIsFace: boolean,
): void {
  const partCache = partIsFace ? 0 : 3;
  const plc = caches[partCache];
  const prc = caches[partCache + 1];
  const phc = caches[partCache + 2];
  for (let otherPartCache = 0; otherPartCache < 4; otherPartCache += 3) {
    const numOtherSides = otherPartCache === 0 ? numFaces : numBranches;
    const otherCacheContainsPart = partCache === otherPartCache;
    const olc = caches[otherPartCache];
    const orc = caches[otherPartCache + 1];
    const ohc = caches[otherPartCache + 2];
    for (let leftOrRight = 0; leftOrRight < 2; ++leftOrRight) {
      const d = leftOrRight === 0 ? left : right;
      const plcd = plc[d];
      const prcd = prc[d];
      const phcd = phc[d];
      const olcd = olc[d];
      const orcd = orc[d];
      const ohcd = ohc[d];
      killPartIfCoveredInOneDirection(part, partIndex, plcd, prcd, phcd, olcd, orcd, ohcd, numOtherSides, otherCacheContainsPart);
      if (!part.growing) {
        return;
      }
    }
  }
}

export function killPartIfCovered(
  part: Killable,
  partIndex: number,
  caches: SideCache,
  numFaces: number,
  numBranches: number,
  partIsFace: boolean,
): void {
  const d = part.direction;
  const leftDirection = d;
  const rightDirection = rem(d - 1, Directions.values.length) as Direction;
  killPartIfCoveredInOneOfTwoDirections(
    caches,
    numFaces,
    numBranches,
    leftDirection,
    rightDirection,
    part,
    partIndex,
    partIsFace,
  );
}

export function killCoveredFaces(snowflake: Snowflake): void {
  forEachGrowingFace(snowflake, (f, fi) => {
    killPartIfCovered(
      f,
      fi,
      snowflake.sideCaches,
      snowflake.numFaces,
      snowflake.numBranches,
      true
    );
  });
}

export function killCoveredBranches(snowflake: Snowflake): void {
  forEachGrowingBranch(snowflake, (b, bi) => {
    killPartIfCovered(
      b,
      bi,
      snowflake.sideCaches,
      snowflake.numFaces,
      snowflake.numBranches,
      false
    );
  });
}