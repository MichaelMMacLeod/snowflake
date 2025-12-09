import {
  _face_centerX,
  _face_centerY,
  _face_direction,
  _face_growing,
  _face_growthScale,
  _face_size,
  Face
} from "./Face.js";
import * as Faces from "./Face.js";
import {
  _branch_startX,
  _branch_startY,
  _branch_direction,
  _branch_growing,
  _branch_growthScale,
  _branch_length,
  _branch_size,
  Branch
} from "./Branch.js";
import * as Branches from "./Branch.js";
import { _graphic_ctx, Graphic } from "./Graphic.js";
import { Direction } from "./Direction.js";
import * as Directions from "./Direction.js";
import {
  Array6,
  makeArray6,
  rem,
  SideCacheArray,
  sideCacheConstructor
} from "../common/Utils.js";
import * as Sides from "./Side.js";

const MAX_FACES: number = 10000;
const MAX_BRANCHES: number = 10000;
type CacheIndex = 0 | 1 | 2 | 3 | 4 | 5;
const FACE_LEFT_CACHE: CacheIndex = 0;
const FACE_RIGHT_CACHE: CacheIndex = 1;
const FACE_HEIGHT_CACHE: CacheIndex = 2;
const BRANCH_LEFT_CACHE: CacheIndex = 3;
const BRANCH_RIGHT_CACHE: CacheIndex = 4;
const BRANCH_HEIGHT_CACHE: CacheIndex = 5;
type SideCache = [
  Array6<SideCacheArray>,
  Array6<SideCacheArray>,
  Array6<SideCacheArray>,
  Array6<SideCacheArray>,
  Array6<SideCacheArray>,
  Array6<SideCacheArray>,
];

const _faces = 0;
const _branches = 1;
const _numFaces = 2;
const _numBranches = 3;
const _sideCaches = 4;
const _numInitialGrownFaces = 5;
const _numInitialGrownBranches = 6;
export type Snowflake = {
  [_faces]: Array<Face>,
  [_branches]: Array<Branch>,
  [_numFaces]: number,
  [_numBranches]: number,
  [_sideCaches]: SideCache,
  [_numInitialGrownFaces]: number,
  [_numInitialGrownBranches]: number,
};

export const addFaceM = (
  snowflake: Snowflake,
  centerX: number,
  centerY: number,
  size: number,
  isFirstFace: boolean,
  direction: Direction,
  growthScale: number,
  growing: boolean
): boolean => {
  if (snowflake[_numFaces] < MAX_FACES) {
    const f = snowflake[_faces][snowflake[_numFaces]];
    f[_face_centerX] = centerX;
    f[_face_centerY] = centerY;
    f[_face_size] = size;
    f[_face_direction] = direction;
    f[_face_growthScale] = growthScale;
    f[_face_growing] = growing;
    snowflake[_numFaces] += 1;
    return false;
  }
  return true;
}

export const addBranchM = (
  snowflake: Snowflake,
  startX: number,
  startY: number,
  size: number,
  length: number,
  direction: Direction,
  growthScale: number,
  growing: boolean,
): boolean => {
  if (snowflake[_numBranches] < MAX_BRANCHES) {
    const b = snowflake[_branches][snowflake[_numBranches]];
    b[_branch_startX] = startX;
    b[_branch_startY] = startY;
    b[_branch_size] = size;
    b[_branch_length] = length;
    b[_branch_direction] = direction;
    b[_branch_growthScale] = growthScale;
    b[_branch_growing] = growing;
    snowflake[_numBranches] += 1;
    return false;
  }
  return true;
}

const oneZeroArray: [1, 0] = [1, 0];

export const forEachGrowingFace = (snowflake: Snowflake, f: (face: Face, index: number) => void): void => {
  for (let i = snowflake[_numInitialGrownFaces]; i < snowflake[_numFaces]; ++i) {
    const face = snowflake[_faces][i];
    if (!face[_face_growing]) {
      snowflake[_numInitialGrownFaces] += oneZeroArray[Math.min(1, i - snowflake[_numInitialGrownFaces])];
      continue;
    }
    f(snowflake[_faces][i], i);
  }
}

export const forEachGrowingBranch = (snowflake: Snowflake, f: (branch: Branch, index: number) => void): void => {
  for (let i = snowflake[_numInitialGrownBranches]; i < snowflake[_numBranches]; ++i) {
    const branch = snowflake[_branches][i];
    if (!branch[_branch_growing]) {
      snowflake[_numInitialGrownBranches] += oneZeroArray[Math.min(1, i - snowflake[_numInitialGrownBranches])];
      continue;
    }
    f(snowflake[_branches][i], i);
  }
}

export const draw = (g: Graphic, snowflake: Snowflake, foregroundColor: string, drawBranchSides: boolean): boolean => {
  let anyPartOutside = false;
  g[_graphic_ctx].strokeStyle = foregroundColor;
  g[_graphic_ctx].beginPath();
  forEachGrowingFace(snowflake, (f, fi) => anyPartOutside ||= Faces.draw(g, f, fi));
  forEachGrowingBranch(snowflake, (b, _) => anyPartOutside ||= Branches.draw(g, b, drawBranchSides));
  g[_graphic_ctx].stroke();
  return anyPartOutside;
}

const zeroParts = <P>(maxParts: number, zeroPart: () => P): Array<P> => {
  const result = [];
  for (let i = 0; i < maxParts; ++i) {
    result[i] = zeroPart();
  }
  return result;
}

const sideCacheZeroFunc = (length: number): () => SideCacheArray => {
  return () => sideCacheConstructor(length);
}

export const zero = (): Snowflake => {
  const mkFaceCache = sideCacheZeroFunc(MAX_FACES);
  const mkBranchCache = sideCacheZeroFunc(MAX_BRANCHES);
  const faces = zeroParts(MAX_FACES, Faces.zero);
  const branches = zeroParts(MAX_BRANCHES, Branches.zero);
  const numFaces = 1;
  const numBranches = 0;
  const sideCaches: SideCache = [
    makeArray6(mkFaceCache),
    makeArray6(mkFaceCache),
    makeArray6(mkFaceCache),
    makeArray6(mkBranchCache),
    makeArray6(mkBranchCache),
    makeArray6(mkBranchCache),
  ];
  const numInitialGrownFaces = 0;
  const numInitialGrownBranches = 0;
  return [
    faces,
    branches,
    numFaces,
    numBranches,
    sideCaches,
    numInitialGrownFaces,
    numInitialGrownBranches,
  ];
}

export const zeroM = (s: Snowflake): void => {
  s[_numFaces] = 1;
  Faces.zeroM(s[_faces][0])
  s[_numBranches] = 0;
  s[_numInitialGrownFaces] = 0;
  s[_numInitialGrownBranches] = 0;
}

const branchSplittingGrowthScales = [0.5, 0.9, 0.5];

const addBranchesToFace = (snowflake: Snowflake, f: Face, faceIndex: number): void => {
  const initialFraction = 0.01;
  const size = f[_face_size];
  const sizeOfNewBranches = size * initialFraction;

  // This is the offset from the edge of the face that we add to the start of the branch
  // so that it does not overlap the face itself when it is first created. Without this,
  // overlap detection immediatelly kills freshly created branches.
  const safetyOffset = 0.001;

  const distFromCenter = safetyOffset + 1 * size * (1 - initialFraction);
  const cx = f[_face_centerX];
  const cy = f[_face_centerY];

  if (faceIndex === 0) {
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
      const growthScale = f[_face_growthScale] * branchSplittingGrowthScales[k + 1];
      const i = rem(f[_face_direction] + k, 6);
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

export const addBranchesToGrowingFaces = (snowflake: Snowflake): void => {
  forEachGrowingFace(snowflake, (face, fi) => {
    addBranchesToFace(snowflake, face, fi);
    face[_face_growing] = false;
  })
}

const addFaceToBranch = (snowflake: Snowflake, branch: Branch): void => {
  addFaceM(
    snowflake,
    Branches.endCenterX(branch),
    Branches.endCenterY(branch),
    branch[_branch_size],
    false,
    branch[_branch_direction],
    branch[_branch_growthScale],
    true
  );
}

export const addFacesToGrowingBranches = (snowflake: Snowflake): void => {
  forEachGrowingBranch(snowflake, (branch, _) => {
    addFaceToBranch(snowflake, branch);
    branch[_branch_growing] = false;
  });
}

export const cacheNormalizedSides = (snowflake: Snowflake) => {
  forEachGrowingFace(snowflake, (f, fi) => {
    Sides.normalizeFaceRelativeSide2DsM(
      snowflake[_sideCaches][FACE_LEFT_CACHE],
      snowflake[_sideCaches][FACE_RIGHT_CACHE],
      snowflake[_sideCaches][FACE_HEIGHT_CACHE],
      fi,
      f
    );
  });
  forEachGrowingBranch(snowflake, (b, bi) => {
    Sides.normalizeBranchRelativeSide2DsM(
      snowflake[_sideCaches][BRANCH_LEFT_CACHE],
      snowflake[_sideCaches][BRANCH_RIGHT_CACHE],
      snowflake[_sideCaches][BRANCH_HEIGHT_CACHE],
      bi,
      b
    );
  });
}

// Description of the Overlap Detection Algorithm:
//
// To prevent the snowflake from growing through itself, we must kill parts
// of the snowflake which are underneath other parts. We take advantage of
// the fact that each side of every part is oriented in one of six directions.
// There are no lines in worldspace coordinates which are of a different
// orientation. (of course, when it comes to drawing the snowflake, we can
// draw lines however we want).
//
// Determining if two horizontal line segments overlap each other is simple,
// but not all of our lines are horizontal. We simply rotate each
// of the sides of every part around the origin until they are horizontal, storing
// the resulting sides in the SideCache. This rotation process is called
// 'normalization', and is performed by 'cacheNormalizedSides'. Since every side
// is now horizontal, we can use the same simple horizontal-based killing
// algorithm on each side of every part.
//
// The overlap detection algorithm only checks if two out of the six sides of a
// given part are underneath all the other sides in their orientations. These
// two sides are the sides that are facing in the direction in which the part is
// growing. This is not for efficiency; if we checked all sides, parts would stop
// growing because of parts behind them.

export function killPartIfCoveredInOneDirection(
  killPart: () => void,
  partIndex: number,
  sideLeftCache: SideCacheArray,
  sideRightCache: SideCacheArray,
  sideHeightCache: SideCacheArray,
  otherLeftSideCache: SideCacheArray,
  otherRightSideCache: SideCacheArray,
  otherHeightSideCache: SideCacheArray,
  numOtherSides: number,
  otherCacheContainsPart: boolean,
): void {
  const sl = sideLeftCache[partIndex];
  const sr = sideRightCache[partIndex];
  for (let oi = 0; oi < numOtherSides; ++oi) {
    const ol = otherLeftSideCache[oi];
    const or = otherRightSideCache[oi];
    // const overlaps = Sides.overlaps(ol, or, sl, sr);
    const overlaps = ol < sr && sl < or
    if (overlaps
      && !(otherCacheContainsPart && oi === partIndex)
      && otherHeightSideCache[oi] - sideHeightCache[partIndex] > 0
    ) {
      killPart();
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
  killPart: () => void,
  partIsDead: () => boolean,
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
      killPartIfCoveredInOneDirection(killPart, partIndex, plcd, prcd, phcd, olcd, orcd, ohcd, numOtherSides, otherCacheContainsPart);
      if (partIsDead()) {
        return;
      }
    }
  }
}

export function killPartIfCovered(
  partDirection: Direction,
  killPart: () => void,
  partIsDead: () => boolean,
  partIndex: number,
  caches: SideCache,
  numFaces: number,
  numBranches: number,
  partIsFace: boolean,
): void {
  const d = partDirection;
  const leftDirection = d;
  const rightDirection = rem(d - 1, Directions.NUM_DIRECTIONS) as Direction;
  killPartIfCoveredInOneOfTwoDirections(
    caches,
    numFaces,
    numBranches,
    leftDirection,
    rightDirection,
    killPart,
    partIsDead,
    partIndex,
    partIsFace,
  );
}

export const killCoveredFaces = (snowflake: Snowflake): void => {
  forEachGrowingFace(snowflake, (f, fi) => {
    killPartIfCovered(
      f[_face_direction],
      () => f[_face_growing] = false,
      () => !f[_face_growing],
      fi,
      snowflake[_sideCaches],
      snowflake[_numFaces],
      snowflake[_numBranches],
      true
    );
  });
}

export const killCoveredBranches = (snowflake: Snowflake): void => {
  forEachGrowingBranch(snowflake, (b, bi) => {
    killPartIfCovered(
      b[_branch_direction],
      () => b[_branch_growing] = false,
      () => !b[_branch_growing],
      bi,
      snowflake[_sideCaches],
      snowflake[_numFaces],
      snowflake[_numBranches],
      false
    );
  });
}