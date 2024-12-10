import { Face } from "./Face";
import * as Faces from "./Face";
import { Branch } from "./Branch";
import * as Branches from "./Branch";
import { Graphic } from "./Graphic";
import { Direction } from "./Direction";
import * as Directions from "./Direction";
import { Array6, rem } from "./Utils";
import { Side } from "./Side";
import * as Sides from "./Side";
import * as Points from "./Point";

export type Snowflake = {
  faces: Array<Face>,
  branches: Array<Branch>,
};

export function reset(s: Snowflake): void {
  s.faces.length = 1;
  s.faces[0] = Faces.zero();
  s.branches.length = 0;
}

export function draw(graphic: Graphic, snowflake: Snowflake): void {
  snowflake.faces.forEach(f => {
    if (f.growing) {
      Faces.draw(graphic, f)
    }
  });
  snowflake.branches.forEach(b => {
    if (b.growing) {
      Branches.draw(graphic, b)
    }
  });
}

export function zero(): Snowflake {
  return {
    faces: [Faces.zero()],
    branches: [],
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
    if (face.direction === 'none') {
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
      if (face.direction === 'none' || i === 1) {
        return face.growthScale * 0.9;
      }

      //const randomAdjust = Math.random() * 0.5 + 0.5;
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

// Returns the normalized sides of every part (face, branch) in the snowflake. The
// order of the returned sides is the order of 'snowflake.faces' followed by
// 'snowflake.branches', so normalizedSides(sf)[0][0] is the first side of sf.faces[0],
// and normalizedSides(sf)[0][sf.faces.length] is the first side of sf.branches[0]. Sides
// are returned in one of six slots based on their absolute direction.
export function normalizedSides(snowflake: Snowflake): Array6<Array<Side>> {
  const result: Array6<Array<Side>> = [[], [], [], [], [], []];
  snowflake.faces.forEach(f => {
    Sides.normalizedFaceSides(f).forEach((s, i) => {
      const absoluteDirection = (i + Faces.direction(f)) % Directions.values.length;
      result[absoluteDirection].push(s);
    });
  });
  snowflake.branches.forEach(b => {
    Sides.normalizedBranchSides(b).forEach((s, i) => {
      const absoluteDirection = (i + b.direction) % Directions.values.length;
      result[absoluteDirection].push(s);
    });
  });
  return result;
}

export function killCoveredFaces(snowflake: Snowflake, sides: Array6<Array<Side>>): void {
  snowflake.faces.forEach((f, fi) => {
    if (!f.growing) {
      return;
    }
    const d = Faces.direction(f);
    const leftDirection = d;
    const rightDirection = rem(d - 1, Directions.values.length);
    const leftSide = sides[leftDirection][fi];
    const rightSide = sides[rightDirection][fi];
    const otherLeftSides = sides[leftDirection];
    const otherRightSides = sides[rightDirection];
    for (let oi = 0; oi < otherLeftSides.length; ++oi) {
      if (oi === fi) {
        continue;
      }
      const otherLeftSide = otherLeftSides[oi];
      const distance = Sides.overlaps(otherLeftSide, leftSide);
      if (distance !== undefined) {
        f.growing = false;
        break;
      }
    }
    if (!f.growing) {
      return;
    }
    for (let oi = 0; oi < otherRightSides.length; ++oi) {
      if (oi === fi) {
        continue;
      }
      const otherRightSide = otherRightSides[oi];
      const distance = Sides.overlaps(otherRightSide, rightSide);
      if (distance !== undefined) {
        f.growing = false;
        break;
      }
    }
  })
}

export function killCoveredBranches(snowflake: Snowflake, sides: Array6<Array<Side>>): void {
  snowflake.branches.forEach((b, bi) => {
    bi += snowflake.faces.length;
    if (!b.growing) {
      return;
    }
    const d = b.direction;
    const leftDirection = d;
    const rightDirection = rem(d - 1, Directions.values.length);
    const leftSide = sides[leftDirection][bi];
    const rightSide = sides[rightDirection][bi];
    const otherLeftSides = sides[leftDirection];
    const otherRightSides = sides[rightDirection];
    for (let oi = 0; oi < otherLeftSides.length; ++oi) {
      if (oi === bi) {
        continue;
      }
      const otherLeftSide = otherLeftSides[oi];
      const distance = Sides.overlaps(otherLeftSide, leftSide);
      if (distance !== undefined) {
        b.growing = false;
        break;
      }
    }
    if (!b.growing) {
      return;
    }
    for (let oi = 0; oi < otherRightSides.length; ++oi) {
      if (oi === bi) {
        continue;
      }
      const otherRightSide = otherRightSides[oi];
      const distance = Sides.overlaps(otherRightSide, rightSide);
      if (distance !== undefined) {
        b.growing = false;
        break;
      }
    }
  })
}
