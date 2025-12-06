import * as Faces from "./Face.js";
import * as Branches from "./Branch.js";
import { _graphic_ctx, Graphic } from "./Graphic.js";
import { Direction } from "./Direction.js";
import * as Directions from "./Direction.js";
import { Array6, makeArray6, rem, SideCacheArray, sideCacheConstructor } from "../common/Utils.js";
import * as Sides from "./Side.js";
import { branchLengthGrowthScalar, branchSizeGrowthScalar, faceSizeGrowthScalar, faceSizeZero } from "../common/Constants.js";

// Description of the Overlap Detection Algorithm
//
// To prevent the snowflake from growing through itself, we must kill parts
// of the snowflake which are underneath other parts. We take advantage of
// the fact that each side of every part is oriented in one of six directions.
// There are no lines in worldspace coordinates which are of a different
// orientation. (of course, when it comes to drawing the snowflake, we can
// draw lines however we want).
//
// Determining if two horizontal line segments overlap each other is simple,
// and is what 'killPartIfCoveredInOneDirection' (specifically, Sides.overlaps())
// does. This const takes a part and its horizontal side and does a linear 
// search through the horizontal sides of every other part, using Sides.overlaps()
// to check if the sides of the given part are below any other sides. It kills
// the part if its side is below any other side.
//
// Of course, there are four other orientations of sides which we have to worry
// about which are not horizontal. To make our lives easier, we simply rotate each
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
//
// This algorithm is run once for every update, so it must be as fast as possible.
// There are several optimizations to ensure it runs at peak performance. These
// optimizations are enough to make it so that the draw rate of snowflakes is
// no longer bottlenecked by this algorithm but instead by the speed of 
// CanvasRenderingContext2D moveTo() and lineTo() calls (at least on my computer).
// Here are a list of optimzations we do here:
//
// 1. No objects are allocated during the overlap detection algorithm. Algorithms 
//    which return information about the location of points or sides do so by 
//    directly returning numbers instead of returning Point or Side objects.
//
// 2. The snowflake stores Faces and Branches in two separate arrays. Older Faces
//    and older branches occur at the beginning of these arrays. Since these older
//    parts have likely already been killed, we cache the number of initial grown
//    faces and branches. This is used by forEachGrowing{Face,Branch} to 'skip over'
//    these killed parts, reducing needless conditional checks. This information is
//    stored in the snowflake as 'numInitialGrown{Faces,Branches}'.
//
// 3. The SideCache and the arrays of Faces and Branches are never freed, and they
//    never free their elements. We store the number of valid Faces and Branches
//    in the Snowflake as 'num{Faces,Branches}'. It is updated in-place. When
//    resetting the snowflake, we simply set 'num{Faces,Branches}' to zero.
//
// 4. The SideCache and the arrays of Faces and Branches are preallocated to their
//    maximum sizes to eliminate reallocations. NOTE: in V8, it seems like this is
//    okay to do because our maximum size is not gigantic. If it were, say, more
//    64 thousand elements, V8 would change its representation to a sparse array
//    which would incur costly array type transformations when we got around to
//    populating it with real data. (At lease, that's what I've heard).
//
// 5. The SideCache stores numbers directly instead of storing Side or Point
//    objects. This way, the JS engine can store them as arrays of unboxed doubles 
//    instead of arrays of pointers to objects with properties which are doubles.
//
// Historical note: the original overlap detection algorithm used a 'ray tracing'
// strategy to find covered parts. This algorithm shot 'rays' from all around
// the snowflake at its center, stopping each ray at the first part hit. Parts
// which were not hit by rays were considered to be covered, and were subsequently
// killed. The problem with this approach is that it was hard for rays to hit very
// small parts (i.e., newly sprouted Branches and Faces). To stop these parts from
// being killed, a large number of rays was needed. Even allowing for some
// optimization tricks, this proved to be way too slow. The speed that snowflakes
// could grow at using the ray tracing algorithm was measured in tens of seconds.
// With the new algorithm, snowflakes grow in less than 10 milliseconds.

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

const _face_center_xs = 0;
const _face_center_ys = 1;
const _face_sizes = 2;
const _face_growth_scales = 3;
const _branch_start_xs = 4;
const _branch_start_ys = 5;
const _branch_sizes = 6;
const _branch_lengths = 7;
const _branch_growth_scales = 8;
const _face_directions = 9;
const _face_growings = 10;
const _branch_directions = 11;
const _branch_growings = 12;
const _numFaces = 13;
const _numBranches = 14;
const _sideCaches = 15;
const _numInitialGrownFaces = 16;
const _numInitialGrownBranches = 17;
export type Snowflake = {
  [_face_center_xs]: Float32Array,
  [_face_center_ys]: Float32Array,
  [_face_sizes]: Float32Array,
  [_face_growth_scales]: Float32Array,
  [_branch_start_xs]: Float32Array,
  [_branch_start_ys]: Float32Array,
  [_branch_sizes]: Float32Array,
  [_branch_lengths]: Float32Array,
  [_branch_growth_scales]: Float32Array,
  [_face_directions]: Uint8Array,
  [_face_growings]: Uint8Array,
  [_branch_directions]: Uint8Array,
  [_branch_growings]: Uint8Array,
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
  direction: Direction,
  growthScale: number,
  growing: boolean
): boolean => {
  const n = snowflake[_numFaces];
  if (n < MAX_FACES) {
    snowflake[_face_center_xs][n] = centerX;
    snowflake[_face_center_ys][n] = centerY;
    snowflake[_face_sizes][n] = size;
    snowflake[_face_growth_scales][n] = growthScale;
    snowflake[_face_directions][n] = direction;
    snowflake[_face_growings][n] = growing ? 1 : 0;
    snowflake[_numFaces] += 1;
    return false;
  }
  return true;
};

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
  const n = snowflake[_numBranches];
  if (n < MAX_BRANCHES) {
    snowflake[_branch_start_xs][n] = startX;
    snowflake[_branch_start_ys][n] = startY;
    snowflake[_branch_sizes][n] = size;
    snowflake[_branch_lengths][n] = length;
    snowflake[_branch_directions][n] = direction;
    snowflake[_branch_growth_scales][n] = growthScale;
    snowflake[_branch_growings][n] = growing ? 1 : 0;
    snowflake[_numBranches] += 1;
    return false;
  }
  return true;
};

const oneZeroArray: [1, 0] = [1, 0];

export const forEachGrowingFace = (snowflake: Snowflake, f: (index: number) => void): void => {
  for (let i = snowflake[_numInitialGrownFaces]; i < snowflake[_numFaces]; ++i) {
    if (snowflake[_face_growings][i] === 0) {
      snowflake[_numInitialGrownFaces] += oneZeroArray[Math.min(1, i - snowflake[_numInitialGrownFaces])];
      continue;
    }
    f(i);
  }
};

export const forEachGrowingBranch = (snowflake: Snowflake, f: (index: number) => void): void => {
  for (let i = snowflake[_numInitialGrownBranches]; i < snowflake[_numBranches]; ++i) {
    if (snowflake[_branch_growings][i] === 0) {
      snowflake[_numInitialGrownBranches] += oneZeroArray[Math.min(1, i - snowflake[_numInitialGrownBranches])];
      continue;
    }
    f(i);
  }
};

export const draw = (g: Graphic, snowflake: Snowflake, foregroundColor: string): boolean => {
  let anyPartOutside = false;
  g[_graphic_ctx].strokeStyle = foregroundColor;
  g[_graphic_ctx].beginPath();
  forEachGrowingFace(snowflake, fi => {
    const centerX = snowflake[_face_center_xs][fi];
    const centerY = snowflake[_face_center_ys][fi];
    const size = snowflake[_face_sizes][fi];
    const d = snowflake[_face_directions][fi] as Direction;
    const isFirstFace = fi === 0;
    anyPartOutside ||= Faces.draw(g, centerX, centerY, size, d, isFirstFace);
  });
  forEachGrowingBranch(snowflake, bi => {
    const startX = snowflake[_branch_start_xs][bi];
    const startY = snowflake[_branch_start_ys][bi];
    const d = snowflake[_branch_directions][bi] as Direction;
    const size = snowflake[_branch_sizes][bi];
    const length = snowflake[_branch_lengths][bi];
    anyPartOutside ||= Branches.draw(g, startX, startY, size, length, d);
  });
  g[_graphic_ctx].stroke();
  return anyPartOutside;
};

const sideCacheZeroFunc = (length: number): () => SideCacheArray => {
  return () => sideCacheConstructor(length);
};

export const zero = (): Snowflake => {
  const mkFaceCache = sideCacheZeroFunc(MAX_FACES);
  const mkBranchCache = sideCacheZeroFunc(MAX_BRANCHES);

  const faceCenterXS = new Float32Array(MAX_FACES);
  const faceCenterYS = new Float32Array(MAX_FACES);
  const faceSizes = new Float32Array(MAX_FACES);
  const faceGrowthScales = new Float32Array(MAX_FACES);
  const faceDirections = new Uint8Array(MAX_FACES);
  const faceGrowings = new Uint8Array(MAX_FACES);
  const branchStartXs = new Float32Array(MAX_BRANCHES);
  const branchStartYs = new Float32Array(MAX_BRANCHES);
  const branchSizes = new Float32Array(MAX_BRANCHES);
  const branchLengths = new Float32Array(MAX_BRANCHES);
  const branchGrowthScales = new Float32Array(MAX_BRANCHES);
  const branchDirections = new Uint8Array(MAX_BRANCHES);
  const branchGrowings = new Uint8Array(MAX_BRANCHES);
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
    faceCenterXS,
    faceCenterYS,
    faceSizes,
    faceGrowthScales,
    branchStartXs,
    branchStartYs,
    branchSizes,
    branchLengths,
    branchGrowthScales,
    faceDirections,
    faceGrowings,
    branchDirections,
    branchGrowings,
    numFaces,
    numBranches,
    sideCaches,
    numInitialGrownFaces,
    numInitialGrownBranches,
  ];
};

export const zeroM = (s: Snowflake): void => {
  s[_numFaces] = 1;
  s[_face_sizes][0] = faceSizeZero;
  s[_face_growth_scales][0] = 1;
  s[_face_growings][0] = 1;
  s[_numBranches] = 0;
  s[_numInitialGrownFaces] = 0;
  s[_numInitialGrownBranches] = 0;
};

const branchSplittingGrowthScales = [0.5, 0.9, 0.5];

const addBranchesToFace = (snowflake: Snowflake, fi: number): void => {
  const initialFraction = 0.01;
  const faceSize = snowflake[_face_sizes][fi];
  const sizeOfNewBranches = faceSize * initialFraction;

  // This is the offset from the edge of the face that we add to the start of the branch
  // so that it does not overlap the face itself when it is first created. Without this,
  // overlap detection immediatelly kills freshly created branches.
  const safetyOffset = 0.001;

  const distFromCenter = safetyOffset + 1 * faceSize * (1 - initialFraction);
  const faceCenterX = snowflake[_face_center_xs][fi];
  const faceCenterY = snowflake[_face_center_ys][fi];

  if (fi === 0) {
    const growthScale = branchSplittingGrowthScales[1];
    for (let i = 0; i < 6; ++i) {
      addBranchM(
        snowflake,
        faceCenterX + distFromCenter * Directions.cosines[i],
        faceCenterY + distFromCenter * Directions.sines[i],
        sizeOfNewBranches,
        0,
        i as Direction,
        growthScale,
        true
      );
    }
  } else {
    for (let k = -1; k < 2; ++k) {
      const growthScale = snowflake[_face_growth_scales][fi] * branchSplittingGrowthScales[k + 1];
      const i = rem(snowflake[_face_directions][fi] + k, 6);
      addBranchM(
        snowflake,
        faceCenterX + distFromCenter * Directions.cosines[i],
        faceCenterY + distFromCenter * Directions.sines[i],
        sizeOfNewBranches,
        0,
        i as Direction,
        growthScale,
        true
      );
    }
  }
};

export const addBranchesToGrowingFaces = (snowflake: Snowflake): void => {
  forEachGrowingFace(snowflake, fi => {
    addBranchesToFace(snowflake, fi);
    snowflake[_face_growings][fi] = 0;
  })
};

const addFaceToBranch = (snowflake: Snowflake, bi: number): void => {
  const startX = snowflake[_branch_start_xs][bi];
  const startY = snowflake[_branch_start_ys][bi];
  const length = snowflake[_branch_lengths][bi];
  const d = snowflake[_branch_directions][bi] as Direction;
  const size = snowflake[_branch_sizes][bi];
  const growthScale = snowflake[_branch_growth_scales][bi];
  addFaceM(
    snowflake,
    Branches.endCenterX(startX, length, d),
    Branches.endCenterY(startY, length, d),
    size,
    d,
    growthScale,
    true
  );
};

export const addFacesToGrowingBranches = (snowflake: Snowflake): void => {
  forEachGrowingBranch(snowflake, bi => {
    addFaceToBranch(snowflake, bi);
    snowflake[_branch_growings][bi] = 0;
  });
};

export const enlargeGrowingFaces = (snowflake: Snowflake, scale: number) => {
  forEachGrowingFace(snowflake, fi => {
    const growthScale = snowflake[_face_growth_scales][fi];
    snowflake[_face_sizes][fi] += scale * faceSizeGrowthScalar * growthScale;
    if (fi !== 0) {
      const d = snowflake[_face_directions][fi];
      const dx = scale * faceSizeGrowthScalar * Math.cos(Directions.values[d]) * growthScale;
      const dy = scale * faceSizeGrowthScalar * Math.sin(Directions.values[d]) * growthScale;
      snowflake[_face_center_xs][fi] += dx;
      snowflake[_face_center_ys][fi] += dy;
    }
  });
};

export const enlargeGrowingBranches = (snowflake: Snowflake) => {
  forEachGrowingBranch(snowflake, bi => {
    const growthScale = snowflake[_branch_growth_scales][bi];
    snowflake[_branch_sizes][bi] += branchSizeGrowthScalar * growthScale;
    snowflake[_branch_lengths][bi] += branchLengthGrowthScalar * growthScale;
  });
};

export const cacheNormalizedSides = (snowflake: Snowflake) => {
  forEachGrowingFace(snowflake, fi => {
    Sides.normalizeFaceRelativeSide2DsM(
      snowflake[_sideCaches][FACE_LEFT_CACHE],
      snowflake[_sideCaches][FACE_RIGHT_CACHE],
      snowflake[_sideCaches][FACE_HEIGHT_CACHE],
      fi,
      snowflake[_face_center_xs][fi],
      snowflake[_face_center_ys][fi],
      snowflake[_face_sizes][fi]
    );
  });
  forEachGrowingBranch(snowflake, bi => {
    const startX = snowflake[_branch_start_xs][bi];
    const startY = snowflake[_branch_start_ys][bi];
    const length = snowflake[_branch_lengths][bi];
    const d = snowflake[_branch_directions][bi] as Direction;
    const size = snowflake[_branch_sizes][bi];
    Sides.normalizeBranchRelativeSide2DsM(
      snowflake[_sideCaches][BRANCH_LEFT_CACHE],
      snowflake[_sideCaches][BRANCH_RIGHT_CACHE],
      snowflake[_sideCaches][BRANCH_HEIGHT_CACHE],
      bi,
      startX,
      startY,
      length,
      d,
      size,
    );
  });
};

export const killPartIfCoveredInOneDirection = (
  partIndex: number,
  sideLeftCache: SideCacheArray,
  sideRightCache: SideCacheArray,
  sideHeightCache: SideCacheArray,
  otherLeftSideCache: SideCacheArray,
  otherRightSideCache: SideCacheArray,
  otherHeightSideCache: SideCacheArray,
  numOtherSides: number,
  otherCacheContainsPart: boolean,
  growings: Uint8Array,
): void => {
  const sl = sideLeftCache[partIndex];
  const sr = sideRightCache[partIndex];
  for (let oi = 0; oi < numOtherSides && growings[partIndex] === 1; ++oi) {
    const ol = otherLeftSideCache[oi];
    const or = otherRightSideCache[oi];
    const overlaps = Sides.overlaps(ol, or, sl, sr);
    if (overlaps
      && otherHeightSideCache[oi] - sideHeightCache[partIndex] > 0
      && !(otherCacheContainsPart && oi === partIndex)
    ) {
      growings[partIndex] = 0;
      break;
    }
  }
};

export const killPartIfCoveredInOneOfTwoDirections = (
  caches: SideCache,
  numFaces: number,
  numBranches: number,
  left: Direction,
  right: Direction,
  partIndex: number,
  partIsFace: boolean,
  growings: Uint8Array,
): void => {
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
      killPartIfCoveredInOneDirection(partIndex, plcd, prcd, phcd, olcd, orcd, ohcd, numOtherSides, otherCacheContainsPart, growings);
      if (growings[partIndex] === 0) {
        return;
      }
    }
  }
};

export const killPartIfCovered = (
  partIndex: number,
  caches: SideCache,
  numFaces: number,
  numBranches: number,
  partIsFace: boolean,
  directions: Uint8Array,
  growings: Uint8Array,
): void => {
  const d = directions[partIndex];
  const leftDirection = d as Direction;
  const rightDirection = rem(d - 1, Directions.values.length) as Direction;
  killPartIfCoveredInOneOfTwoDirections(
    caches,
    numFaces,
    numBranches,
    leftDirection,
    rightDirection,
    partIndex,
    partIsFace,
    growings,
  );
};

export const killCoveredFaces = (snowflake: Snowflake): void => {
  forEachGrowingFace(snowflake, fi => {
    killPartIfCovered(
      fi,
      snowflake[_sideCaches],
      snowflake[_numFaces],
      snowflake[_numBranches],
      true,
      snowflake[_face_directions],
      snowflake[_face_growings]
    );
  });
};

export const killCoveredBranches = (snowflake: Snowflake): void => {
  forEachGrowingBranch(snowflake, bi => {
    killPartIfCovered(
      bi,
      snowflake[_sideCaches],
      snowflake[_numFaces],
      snowflake[_numBranches],
      false,
      snowflake[_branch_directions],
      snowflake[_branch_growings]
    );
  });
};
