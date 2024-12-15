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

export function normalizeSide2DFaceM(
  resultLeft: Array<number>,
  resultRight: Array<number>,
  resultHeight: Array<number>,
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
  resultLeft: Array<number>,
  resultRight: Array<number>,
  resultHeight: Array<number>,
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
  resultLeft: Array6<Array<number>>,
  resultRight: Array6<Array<number>>,
  resultHeight: Array6<Array<number>>,
  partIndex: number, face: Face
): void {
  for (let i = 0; i < Directions.values.length; ++i) {
    normalizeSide2DFaceM(resultLeft[i], resultRight[i], resultHeight[i], partIndex, face, i);
  }
}

export function normalizeBranchRelativeSide2DsM(
  resultLeft: Array6<Array<number>>,
  resultRight: Array6<Array<number>>,
  resultHeight: Array6<Array<number>>,
  partIndex: number,
  branch: Branch
): void {
  for (let i = 0; i < Directions.values.length; ++i) {
    normalizeSide2DBranchM(resultLeft[i], resultRight[i], resultHeight[i], partIndex, branch, i);
  }
}

export function overlapDistance(s1: Side, s2: Side): number {
  return s1.height - s2.height;
}

export function overlapDistanceRaw(height1: number, height2: number) {
  return height1 - height2;
}

export function overlaps(s1: Side, s2: Side): boolean {
  // s1 ---......
  // s2       ......---
  //    and
  // s1       ......--- 
  // s2 ---......
  return s1.left < s2.right && s2.left < s1.right;
}

export function overlapsRaw(l1: number, r1: number, l2: number, r2: number): boolean {
  return l1 < r2 && l2 < r1;
}