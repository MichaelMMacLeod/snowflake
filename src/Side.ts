import { oneSixthCircle } from "./Constants";
import { Face } from "./Face";
import { Point } from "./Point";
import * as Points from "./Point";
import { Side2D } from "./Side2D";
import * as Side2Ds from "./Side2D";
import { Array6, mapArray6, rem } from "./Utils";
import * as Directions from "./Direction";
import { Direction } from "./Direction";
import * as Faces from "./Face";
import { Branch } from "./Branch";

export type Side = {
  left: number,
  right: number,
  height: number,
};

export function zero(): Side {
  return {
    left: 0,
    right: 0,
    height: 0,
  }
}

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

export function normalizeSide2DM(result: Side, side2d: Side2D, absoluteDirection: number): void {
  const theta = oneSixthCircle * (1 - absoluteDirection);
  const left = Points.rotate(side2d.left, theta);
  const right = Points.rotate(side2d.right, theta);
  result.left = left.x;
  result.right = right.x;
  result.height = left.y;
}

export function normalizeSide2DFaceM(result: Side, face: Face, absoluteDirection: number): void {
  const theta = oneSixthCircle * (1 - absoluteDirection);
  const side2dLeftX = Side2Ds.faceSideNLeftX(face, absoluteDirection);
  const side2dLeftY = Side2Ds.faceSideNLeftY(face, absoluteDirection);
  const side2dRightX = Side2Ds.faceSideNRightX(face, absoluteDirection);
  const side2dRightY = Side2Ds.faceSideNRightY(face, absoluteDirection);
  const left = Points.rotate({ x: side2dLeftX, y: side2dLeftY }, theta);
  const right = Points.rotate({ x: side2dRightX, y: side2dRightY }, theta);
  result.left = left.x;
  result.right = right.x;
  result.height = left.y;
}

export function normalizeSide2DBranchM(result: Side, branch: Branch, absoluteDirection: number): void {
  const theta = oneSixthCircle * (1 - absoluteDirection);
  const side2dLeftX = Side2Ds.branchSideNLeftX(branch, absoluteDirection);
  const side2dLeftY = Side2Ds.branchSideNLeftY(branch, absoluteDirection);
  const side2dRightX = Side2Ds.branchSideNRightX(branch, absoluteDirection);
  const side2dRightY = Side2Ds.branchSideNRightY(branch, absoluteDirection);
  const left = Points.rotate({ x: side2dLeftX, y: side2dLeftY }, theta);
  const right = Points.rotate({ x: side2dRightX, y: side2dRightY }, theta);
  result.left = left.x;
  result.right = right.x;
  result.height = left.y;
}

export function normalizeRelativeSide2Ds(side2Ds: Array6<Side2D>, shapeDir: Direction): Array6<Side> {
  return mapArray6(side2Ds, (s, i) => normalizeSide2D(s, (i + shapeDir) % Directions.values.length));
}

export function normalizeRelativeSide2DsM(result: Array6<Array<Side>>, partIndex: number, side2Ds: Array6<Side2D>, shapeDir: Direction): void {
  for (let i = 0; i < Directions.values.length; ++i) {
    const relativeDirection = rem((i - shapeDir), Directions.values.length);
    normalizeSide2DM(result[i][partIndex], side2Ds[relativeDirection], i);
  }
}

export function normalizeFaceRelativeSide2DsM(result: Array6<Array<Side>>, partIndex: number, face: Face): void {
  for (let i = 0; i < Directions.values.length; ++i) {
    normalizeSide2DFaceM(result[i][partIndex], face, i);
  }
}

export function normalizeBranchRelativeSide2DsM(result: Array6<Array<Side>>, partIndex: number, branch: Branch): void {
  for (let i = 0; i < Directions.values.length; ++i) {
    normalizeSide2DBranchM(result[i][partIndex], branch, i);
  }
}

export function normalizeFaceSidesM(result: Array6<Array<Side>>, faceIndex: number, face: Face): void {
  normalizeRelativeSide2DsM(result, faceIndex, Side2Ds.ofFace(face), face.direction);
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

export function normalizeBranchSidesM(result: Array6<Array<Side>>, branchIndex: number, branch: Branch): void {
  normalizeRelativeSide2DsM(result, branchIndex, Side2Ds.ofBranch(branch), branch.direction);
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