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

export function normalizeSide2DFaceM(result: Side, face: Face, absoluteDirection: number): void {
  const d = rem(1 - absoluteDirection, Directions.values.length) as Direction;
  const side2dLeftX = Side2Ds.faceSideNLeftX(face, absoluteDirection);
  const side2dLeftY = Side2Ds.faceSideNLeftY(face, absoluteDirection);
  const side2dRightX = Side2Ds.faceSideNRightX(face, absoluteDirection);
  const side2dRightY = Side2Ds.faceSideNRightY(face, absoluteDirection);
  result.left = Points.rotateX(side2dLeftX, side2dLeftY, d);
  result.right = Points.rotateX(side2dRightX, side2dRightY, d);
  result.height = Points.rotateY(side2dLeftX, side2dLeftY, d);
}

export function normalizeSide2DBranchM(result: Side, branch: Branch, absoluteDirection: number): void {
  const d = rem(1 - absoluteDirection, Directions.values.length) as Direction;
  const side2dLeftX = Side2Ds.branchSideNLeftX(branch, absoluteDirection);
  const side2dLeftY = Side2Ds.branchSideNLeftY(branch, absoluteDirection);
  const side2dRightX = Side2Ds.branchSideNRightX(branch, absoluteDirection);
  const side2dRightY = Side2Ds.branchSideNRightY(branch, absoluteDirection);
  result.left = Points.rotateX(side2dLeftX, side2dLeftY, d);
  result.right = Points.rotateX(side2dRightX, side2dRightY, d);
  result.height = Points.rotateY(side2dLeftX, side2dLeftY, d);
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

// Returns how far above s1 is from s2 if s1 is above and overlapping
// s2, otherwise returns undefined.
export function overlaps(s1: Side, s2: Side): number | undefined {
  // const c1 = s1.height > s2.height;
  // const c2 = s1.left < s2.left && s1.right > s2.left;
  // const c3 = s1.left > s2.left && s2.right > s1.left;
  // const c4 = s1.left < s2.left && s1.right > s2.right;
  // const c5 = s1.left > s2.left && s1.right < s2.right;
  if ((s1.height > s2.height) && ((s1.left < s2.left && s1.right > s2.right) || (s1.left > s2.left && s2.right > s1.left) || (s1.left < s2.left && s1.right > s2.left) || (s1.left > s2.left && s1.right < s2.right))) {
    return s1.height - s2.height;
  }
  return undefined;
  // const w = window as any;
  // // 212916781 34053371 20584139 16045439 7337022
  // // 16045439c4, 20584139c3, 212916781c1, 34053371c2, 7337022c5
  // //212916781c1 34053371c2 20584139c3 16045439c4 7337022c5
  // w.c1 = w.c1 === undefined ? 0 : w.c1;
  // w.c2 = w.c2 === undefined ? 0 : w.c2;
  // w.c3 = w.c3 === undefined ? 0 : w.c3;
  // w.c4 = w.c4 === undefined ? 0 : w.c4;
  // w.c5 = w.c5 === undefined ? 0 : w.c5;
  // w.c1 += +c1;
  // w.c2 += +c2;
  // w.c3 += +c3;
  // w.c4 += +c4;
  // w.c5 += +c5;
  // w.summarize = () => {
  //   console.log(w.c1, w.c2, w.c3, w.c4, w.c5);
  // }
  // if (s1.height > s2.height &&
  //   (s1.left < s2.left && s1.right > s2.left ||
  //     s1.left > s2.left && s2.right > s1.left ||
  //     s1.left < s2.left && s1.right > s2.right ||
  //     s1.left > s2.left && s1.right < s2.right)) {
  //   return s1.height - s2.height;
  // }

  // return undefined;
}