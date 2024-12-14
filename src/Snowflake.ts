import { Face } from "./Face";
import * as Faces from "./Face";
import { Branch } from "./Branch";
import * as Branches from "./Branch";
import { Graphic } from "./Graphic";
import { Direction } from "./Direction";
import * as Directions from "./Direction";
import { Array6, makeArray6, rem } from "./Utils";
import { Side } from "./Side";
import * as Sides from "./Side";
import * as Points from "./Point";
import { Side2D } from "./Side2D";

export type Snowflake = {
  faces: Array<Face>,
  branches: Array<Branch>,
  //           face side cache,     branch side cache
  sideCaches: [Array6<Array<Side>>, Array6<Array<Side>>],
  numInitialGrownFaces: number,
  numInitialGrownBranches: number,
};

export function reset(s: Snowflake): void {
  s.faces.length = 1;
  s.faces[0] = Faces.zero();
  s.branches.length = 0;
  for (let i = 0; i < Directions.values.length; ++i) {
    s.sideCaches[0][i].length = 0;
    s.sideCaches[1][i].length = 0;
  }
  s.numInitialGrownFaces = 0;
  s.numInitialGrownBranches = 0;
}

export function draw(graphic: Graphic, snowflake: Snowflake): boolean {
  let anyPartOutside = false;
  graphic.ctx.strokeStyle = `rgba(255, 255, 255, 0.08)`;
  graphic.ctx.beginPath();
  snowflake.faces.forEach(f => {
    if (f.growing) {
      anyPartOutside ||= Faces.draw(graphic, f)
    }
  });
  snowflake.branches.forEach(b => {
    if (b.growing) {
      anyPartOutside ||= Branches.draw(graphic, b)
    }
  });
  graphic.ctx.stroke();
  return anyPartOutside;
}

export function zero(): Snowflake {
  return {
    faces: [Faces.zero()],
    branches: [],
    sideCaches: [makeArray6(() => []), makeArray6(() => [])],
    numInitialGrownFaces: 0,
    numInitialGrownBranches: 0,
  }
}

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

  let [startDir, numDirs]: [Direction, number] = (() => {
    if (face.isFirstFace) {
      return [0, 6];
    }

    return [
      Directions.previous(face.direction),
      3,
    ];
  })();

  let dir = startDir;
  for (let i = 0; i < numDirs; i += 1) {
    const x = cx + distFromCenter * Math.cos(Directions.values[dir]);
    const y = cy + distFromCenter * Math.sin(Directions.values[dir]);
    const growthScale = (() => {
      if (face.isFirstFace || i === 1) {
        return face.growthScale * 0.9;
      }

      // const randomAdjust = Math.random();
      const randomAdjust = 1;
      return face.growthScale * 0.5 * randomAdjust;
    })();
    snowflake.branches.push({
      start: { x, y },
      size: sizeOfNewBranches,
      length: 0,
      direction: dir as Direction,
      growthScale,
      growing: true,
    });
    dir = Directions.next(dir);
  }
}

export function addBranchesToGrowingFaces(snowflake: Snowflake): void {
  snowflake.faces.forEach((face) => {
    if (face.growing) {
      addBranchesToFace(snowflake, face);
      face.growing = false;
    }
  })
}

function addFaceToBranch(snowflake: Snowflake, branch: Branch): void {
  snowflake.faces.push({
    center: Branches.end(branch),
    isFirstFace: false,
    size: branch.size,
    direction: branch.direction,
    growthScale: branch.growthScale,
    growing: true,
  });
}

export function addFacesToGrowingBranches(snowflake: Snowflake): void {
  snowflake.branches.forEach(branch => {
    if (branch.growing) {
      addFaceToBranch(snowflake, branch);
      branch.growing = false;
    }
  })
}

export function cacheNormalizedSides(snowflake: Snowflake) {
  snowflake.faces.forEach((f, fi) => {
    if (f.growing) {
      Sides.normalizedFaceSides(f).forEach((s, i) => {
        const absoluteDirection = (i + f.direction) % Directions.values.length;
        snowflake.sideCaches[0][absoluteDirection][fi] = s;
      });
    }
  });
  snowflake.branches.forEach((b, bi) => {
    if (b.growing) {
      Sides.normalizedBranchSides(b).forEach((s, i) => {
        const absoluteDirection = (i + b.direction) % Directions.values.length;
        snowflake.sideCaches[1][absoluteDirection][bi] = s;
      });
    }
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
  otherSidesContainsPartSides: boolean,
): void {
  for (let oi = 0; oi < otherSides.length; ++oi) {
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
    killPartIfCoveredInOneDirection(part, partIndex, leftSide, otherLeftSides, inFaceCache);
    if (!part.growing) {
      return;
    }
    killPartIfCoveredInOneDirection(part, partIndex, rightSide, otherRightSides, inFaceCache);
    if (!part.growing) {
      return;
    }
  }
}

export function killPartIfCovered(
  part: Killable,
  partIndex: number,
  caches: [Array6<Array<Side>>, Array6<Array<Side>>],
  partCacheIndex: 0 | 1,
): void {
  const d = part.direction;
  const leftDirection = d;
  const rightDirection = rem(d - 1, Directions.values.length) as Direction;
  const leftSide = caches[partCacheIndex][leftDirection][partIndex];
  const rightSide = caches[partCacheIndex][rightDirection][partIndex];
  killPartIfCoveredInOneOfTwoDirections(caches, leftSide, rightSide, leftDirection, rightDirection, part, partIndex);
}

export function killCoveredFaces(snowflake: Snowflake): void {
  for (let fi = snowflake.numInitialGrownFaces; fi < snowflake.faces.length; ++fi) {
    const f = snowflake.faces[fi];
    if (!f.growing) {
      snowflake.numInitialGrownFaces += [1, 0][Math.min(1, fi - snowflake.numInitialGrownFaces)];
      continue;
    }
    killPartIfCovered(f, fi, snowflake.sideCaches, 0);
  }
}

export function killCoveredBranches(snowflake: Snowflake): void {
  for (let bi = snowflake.numInitialGrownBranches; bi < snowflake.branches.length; ++bi) {
    const b = snowflake.branches[bi];
    if (!b.growing) {
      snowflake.numInitialGrownBranches += [1, 0][Math.min(1, bi - snowflake.numInitialGrownBranches)];
      continue;
    }
    killPartIfCovered(b, bi, snowflake.sideCaches, 1);
  }
}