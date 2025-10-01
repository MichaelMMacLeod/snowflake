import { Face } from "./Face";
import * as Points from "../common/Point";
import * as Side2Ds from "./Side2D";
import { Array6, rem, SideCacheArray } from "../common/Utils";
import * as Directions from "./Direction";
import { Direction } from "./Direction";
import { Branch } from "./Branch";

export function normalizeSide2DFaceM(
  resultLeft: SideCacheArray,
  resultRight: SideCacheArray,
  resultHeight: SideCacheArray,
  partIndex: number,
  face: Face,
  absoluteDirection: number
): void {
  const d = rem(1 - absoluteDirection, Directions.values.length) as Direction;
  const side2dLeftX = Side2Ds.faceSideNLeftX(face, absoluteDirection);
  const side2dLeftY = Side2Ds.faceSideNLeftY(face, absoluteDirection);
  const side2dRightX = Side2Ds.faceSideNRightX(face, absoluteDirection);
  const side2dRightY = Side2Ds.faceSideNRightY(face, absoluteDirection);
  resultLeft[partIndex] = Points.rotateX(side2dLeftX, side2dLeftY, d);
  resultRight[partIndex] = Points.rotateX(side2dRightX, side2dRightY, d);
  resultHeight[partIndex] = Points.rotateY(side2dLeftX, side2dLeftY, d);
}

export function normalizeSide2DBranchM(
  resultLeft: SideCacheArray,
  resultRight: SideCacheArray,
  resultHeight: SideCacheArray,
  partIndex: number,
  branch: Branch,
  absoluteDirection: number
): void {
  const d = rem(1 - absoluteDirection, Directions.values.length) as Direction;
  const side2dLeftX = Side2Ds.branchSideNLeftX(branch, absoluteDirection);
  const side2dLeftY = Side2Ds.branchSideNLeftY(branch, absoluteDirection);
  const side2dRightX = Side2Ds.branchSideNRightX(branch, absoluteDirection);
  const side2dRightY = Side2Ds.branchSideNRightY(branch, absoluteDirection);
  resultLeft[partIndex] = Points.rotateX(side2dLeftX, side2dLeftY, d);
  resultRight[partIndex] = Points.rotateX(side2dRightX, side2dRightY, d);
  resultHeight[partIndex] = Points.rotateY(side2dLeftX, side2dLeftY, d);
}

export function normalizeFaceRelativeSide2DsM(
  resultLeft: Array6<SideCacheArray>,
  resultRight: Array6<SideCacheArray>,
  resultHeight: Array6<SideCacheArray>,
  partIndex: number, face: Face
): void {
  for (let i = 0; i < Directions.values.length; ++i) {
    normalizeSide2DFaceM(resultLeft[i], resultRight[i], resultHeight[i], partIndex, face, i);
  }
}

export function normalizeBranchRelativeSide2DsM(
  resultLeft: Array6<SideCacheArray>,
  resultRight: Array6<SideCacheArray>,
  resultHeight: Array6<SideCacheArray>,
  partIndex: number,
  branch: Branch
): void {
  for (let i = 0; i < Directions.values.length; ++i) {
    normalizeSide2DBranchM(resultLeft[i], resultRight[i], resultHeight[i], partIndex, branch, i);
  }
}
export function overlapDistance(height1: number, height2: number) {
  return height1 - height2;
}

// Returns 'true' if the line segments l1...r1 and l2...r2 overlap.
export function overlaps(l1: number, r1: number, l2: number, r2: number): boolean {
  // s1 ---......
  // s2       ......---
  //    and
  // s1       ......--- 
  // s2 ---......
  return l1 < r2 && l2 < r1;
}