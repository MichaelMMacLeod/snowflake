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

export function overlapDistance(s1: Side, s2: Side): number {
  return s1.height - s2.height;
}

export function overlaps(s1: Side, s2: Side): boolean {
  // s1 ---......
  // s2       ......---
  //    and
  // s1       ......--- 
  // s2 ---......
  return s1.left < s2.right && s2.left < s1.right;
}