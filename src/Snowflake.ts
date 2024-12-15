import { Face } from "./Face";
import * as Faces from "./Face";
import { Branch } from "./Branch";
import * as Branches from "./Branch";
import { Graphic } from "./Graphic";
import { Direction, DIRS } from "./Direction";
import * as Directions from "./Direction";
import { Array6, makeArray6, rem, SideCacheArray, sideCacheConstructor } from "./Utils";
import * as Sides from "./Side";

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
// does. This function takes a part and its horizontal side and does a linear 
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
// 6. 'reduce_funcs' in Webpack's TerserPlugin is disabled. This option, when
//    enabled, transforms code like this:
//
//    | export function normalizeSide2DFaceM(
//    |   resultLeft: SideCacheArray,
//    |   resultRight: SideCacheArray,
//    |   resultHeight: SideCacheArray,
//    |   partIndex: number,
//    |   face: Face,
//    |   absoluteDirection: number
//    | ): void {
//    |   const d = rem(1 - absoluteDirection, Directions.values.length) as Direction;
//    |   const side2dLeftX = Side2Ds.faceSideNLeftX(face, absoluteDirection);
//    |   const side2dLeftY = Side2Ds.faceSideNLeftY(face, absoluteDirection);
//    |   const side2dRightX = Side2Ds.faceSideNRightX(face, absoluteDirection);
//    |   const side2dRightY = Side2Ds.faceSideNRightY(face, absoluteDirection);
//    |   resultLeft[partIndex] = Points.rotateX(side2dLeftX, side2dLeftY, d);
//    |   resultRight[partIndex] = Points.rotateX(side2dRightX, side2dRightY, d);
//    |   resultHeight[partIndex] = Points.rotateY(side2dLeftX, side2dLeftY, d);
//    | }
//
//    Into code like this:
//
//    | function normalizeSide2DFaceM(resultLeft, resultRight, resultHeight, partIndex, face, absoluteDirection) {
//    |   const d = Utils_rem(1 - absoluteDirection, values.length)
//    |     , side2dLeftX = function(face, absoluteSideIndex) {
//    |       return pointNX(face, (absoluteSideIndex + 1) % values.length)
//    |   }(face, absoluteDirection)
//    |     , side2dLeftY = function(face, absoluteSideIndex) {
//    |       return pointNY(face, (absoluteSideIndex + 1) % values.length)
//    |   }(face, absoluteDirection)
//    |     , side2dRightX = function(face, absoluteSideIndex) {
//    |       return pointNX(face, absoluteSideIndex)
//    |   }(face, absoluteDirection)
//    |     , side2dRightY = function(face, absoluteSideIndex) {
//    |       return pointNY(face, absoluteSideIndex)
//    |   }(face, absoluteDirection);
//    |   resultLeft[partIndex] = rotateX(side2dLeftX, side2dLeftY, d),
//    |   resultRight[partIndex] = rotateX(side2dRightX, side2dRightY, d),
//    |   resultHeight[partIndex] = rotateY(side2dLeftX, side2dLeftY, d)
//    | }
//
//    Using Chrome's performance profiler, the effect of this transformation seems
//    to be that 'normalizeSide2DFaceM' now allocates closures which are then
//    immediately applied (and need to then be freed by the garbage collector).
//    The code with this option turned off seems to not need to perform any allocations.
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

function zeroParts<P>(maxParts: number, zeroPart: () => P): Array<P> {
  const result = [];
  for (let i = 0; i < maxParts; ++i) {
    result[i] = zeroPart();
  }
  return result;
}

function sideCacheZeroFunc(length: number): () => SideCacheArray {
  return () => sideCacheConstructor(length);
}

export function zero(): Snowflake {
  const mkFaceCache = sideCacheZeroFunc(MAX_FACES);
  const mkBranchCache = sideCacheZeroFunc(MAX_BRANCHES);
  const sideCaches: SideCache = [
    makeArray6(mkFaceCache),
    makeArray6(mkFaceCache),
    makeArray6(mkFaceCache),
    makeArray6(mkBranchCache),
    makeArray6(mkBranchCache),
    makeArray6(mkBranchCache),
  ];
  const faces = zeroParts(MAX_FACES, Faces.zero);
  const branches = zeroParts(MAX_BRANCHES, Branches.zero);
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

// The only things this describes for our purposes are Faces and Branches.
type Killable = {
  direction: Direction,
  growing: boolean,
};

export function killPartIfCoveredInOneDirection(
  part: Killable,
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
  for (let oi = 0; oi < numOtherSides && part.growing; ++oi) {
    const ol = otherLeftSideCache[oi];
    const or = otherRightSideCache[oi];
    const overlaps = Sides.overlaps(ol, or, sl, sr);
    if (overlaps
      && otherHeightSideCache[oi] - sideHeightCache[partIndex] > 0
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