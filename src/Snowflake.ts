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
  snowflake.faces.forEach(f => Faces.draw(graphic, f));
  snowflake.branches.forEach(b => Branches.draw(graphic, b));
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



























// function drawSide(graphic: Graphic, side: Side, index: number, face: Face): void {
//   // if (index !== 4) {
//   //   return;
//   // }
//   graphic.ctx.beginPath();
//   //  const h = 1/6 * (index + 1);
//   const h = side.height;
//   const left = worldToViewTransform(graphic, { x: side.left, y: h });
//   const right = worldToViewTransform(graphic, { x: side.right, y: h });
//   graphic.ctx.moveTo(left.x, left.y);
//   graphic.ctx.lineTo(right.x, right.y);
//   const oldWidth = graphic.ctx.lineWidth;
//   graphic.ctx.lineWidth = 10;
//   graphic.ctx.strokeStyle = `rgba(${255 / 6 * (index + 1)}, 0, 255, 0.2)`;
//   graphic.ctx.stroke();
//   graphic.ctx.lineWidth = oldWidth;
// }

// function drawNormalization(graphic: Graphic, side2d: Side2D, absoluteDirection: number): void {
//   if (absoluteDirection !== 0)
//     return;

//   const oldWidth = graphic.ctx.lineWidth;
//   const oldStyle = graphic.ctx.strokeStyle;

//   // // draw the side2d
//   // {
//   //   const left = worldToViewTransform(graphic, side2d.left);
//   //   const right = worldToViewTransform(graphic, side2d.right);
//   //   graphic.ctx.beginPath();
//   //   graphic.ctx.moveTo(left.x, left.y);
//   //   graphic.ctx.lineTo(right.x, right.y);
//   //   graphic.ctx.lineWidth = 10;
//   //   graphic.ctx.strokeStyle = `rgba(0, 0, 255, 0.2)`;
//   //   graphic.ctx.stroke();
//   // }

//   // draw the side
//   const side = normalizeSide2D(side2d, absoluteDirection);
//   const left = worldToViewTransform(graphic, { x: side.left, y: side.height });
//   const right = worldToViewTransform(graphic, { x: side.right, y: side.height });
//   graphic.ctx.beginPath();
//   graphic.ctx.moveTo(left.x, left.y);
//   graphic.ctx.lineTo(right.x, right.y);
//   graphic.ctx.lineWidth = 10;
//   graphic.ctx.strokeStyle = `rgba(203, 203, 255, 1)`;
//   graphic.ctx.stroke();

//   // draw the line
//   const middle2d = worldToViewTransform(graphic, {
//     x: 0.5 * (side2d.left.x + side2d.right.x),
//     y: 0.5 * (side2d.left.y + side2d.right.y),
//   });
//   const middle = worldToViewTransform(graphic, {
//     x: 0.5 * (side.left + side.right),
//     y: side.height,
//   });
//   graphic.ctx.beginPath();
//   graphic.ctx.moveTo(middle2d.x, middle2d.y);
//   graphic.ctx.lineTo(middle.x, middle.y);
//   graphic.ctx.lineWidth = 1
//   graphic.ctx.strokeStyle = 'rgba(0, 0, 0, 1)';
//   graphic.ctx.stroke();

//   // cleanup
//   graphic.ctx.lineWidth = oldWidth;
//   graphic.ctx.strokeStyle = oldStyle;
// }

// function toCanvasPoint(p: Point): Point {
//   const result = { x: p.x, y: p.y };

//   result.x *= graphic.canvas.width / 2;
//   result.y *= -graphic.canvas.height / 2;

//   result.x += graphic.canvas.width * 0.5;
//   result.y += graphic.canvas.height * 0.5;

//   return result;
// }

// function squareDistance(p1: Point, p2: Point): number {
//   const dx = p2.x - p1.x;
//   const dy = p2.y - p1.y;
//   return dx * dx + dy * dy;
// }

// function distance(p1: Point, p2: Point): number {
//   return Math.sqrt(squareDistance(p1, p2));
// }

// type Circle = {
//   center: Point,
//   radius: number,
// };

// type Side2D = {
//   left: Point,
//   right: Point,
// };

// type Side = {
//   left: number,
//   right: number,
//   height: number,
// };

// type SideFace = {
//   side: Side,
//   face: Face,
//   growing: boolean,
// };

// type SideBranch = {
//   side: Side,
//   branch: Branch,
//   growing: boolean,
// };

// // Returns a side at the same hight as `side` but scaled by `scale`
// // (scale=1 returns the same side, scale=2 returns twice side, etc.).
// function biggerSide(side: Side, scale: number): Side {
//   return {
//     left: side.left * scale,
//     right: side.right * scale,
//     height: side.height,
//   };
// }





// type Array6<T> = [
//   Array<T>,
//   Array<T>,
//   Array<T>,
//   Array<T>,
//   Array<T>,
//   Array<T>,
// ];

// type Array6XSideFace = [
//   Array<SideFace>,
//   Array<SideFace>,
//   Array<SideFace>,
//   Array<SideFace>,
//   Array<SideFace>,
//   Array<SideFace>
// ];

// type Array6XSideBranch = [
//   Array<SideBranch>,
//   Array<SideBranch>,
//   Array<SideBranch>,
//   Array<SideBranch>,
//   Array<SideBranch>,
//   Array<SideBranch>
// ];

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


// type Section<P> = {
//   side: Side,
//   part: P,
// };

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
