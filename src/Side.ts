import { oneSixthCircle } from "./Constants";
import { Face } from "./Face";
import { Point } from "./Point";
import * as Points from "./Point";
import { Side2D } from "./Side2D";
import * as Side2Ds from "./Side2D";
import { Array6, mapArray6 } from "./Utils";
import * as Directions from "./Direction";
import { Direction } from "./Direction";
import * as Faces from "./Face";
import { Branch } from "./Branch";

export type Side = {
    left: number,
    right: number,
    height: number,
};

// Returns a Side calculated by rotating a 'Side2d' around the origin
// counterclockwise until it is horizontal. 'absoluteDirection' should be the
// non-relative number of the side, starting from the rightmost upward
// side and going counterclockwise. 'absoluteDirection' is zero indexed.
//
// absoluteDirection = ...
//
//         1
//       -----
//    2 /     \  0
//     /       \
//     \       /
//   3  \     /  5
//       -----
//         4
export function normalizeSide2D(side2d: Side2D, absoluteDirection: number): Side {
    const theta = oneSixthCircle * (1 - absoluteDirection);
    const left = Points.rotate(side2d.left, theta);
    const right = Points.rotate(side2d.right, theta);
    return {
        left: left.x,
        right: right.x,
        height: left.y,
    };
}

export function normalizeRelativeSide2Ds(side2Ds: Array6<Side2D>, shapeDir: Direction): Array6<Side> {
    return mapArray6(side2Ds, (s, i) => normalizeSide2D(s, (i + shapeDir) % Directions.values.length));
}

// Normalizes the sides of a face. Sides are returned in relative order to their
// un-normalized counterparts.
//         1
//       -----
//    2 /     \  0
//     /       \ _____direction___>
//     \       /
//   3  \     /  5
//       -----
//         4
export function normalizedFaceSides(face: Face): Array6<Side> {
    return normalizeRelativeSide2Ds(Side2Ds.ofFace(face), Faces.direction(face));
}

// Normalizes the sides of a face. Sides are returned in relative order to their
// un-normalized counterparts.
//                  1
//       -------------------------
//    2 /                         \  0
//     /                           \ _____direction___>
//     \                           /
//   3  \                         /  5
//       -------------------------
//                  4
export function normalizedBranchSides(branch: Branch): Array<Side> {
    return normalizeRelativeSide2Ds(Side2Ds.ofBranch(branch), branch.direction);
}

// Returns how far above s1 is from s2 if s1 is above and overlapping
// s2, otherwise returns undefined.
export function overlaps(s1: Side, s2: Side): number | undefined {
  if (s1.height > s2.height &&
    (s1.left < s2.left && s1.right > s2.left ||
      s1.left > s2.left && s2.right > s1.left ||
      s1.left < s2.left && s1.right > s2.right ||
      s1.left > s2.left && s1.right < s2.right)) {
    return s1.height - s2.height;
  }

  return undefined;
}