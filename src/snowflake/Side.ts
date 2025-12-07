import { Face } from "./Face.js";
import * as Points from "../common/Point.js";
import * as Side2Ds from "./Side2D.js";
import { Array6, rem, SideCacheArray } from "../common/Utils.js";
import * as Directions from "./Direction.js";
import { Direction } from "./Direction.js";
import { Branch } from "./Branch.js";

export const normalizeSide2DFaceM = (
  resultLeft: SideCacheArray,
  resultRight: SideCacheArray,
  resultHeight: SideCacheArray,
  partIndex: number,
  face: Face,
  absoluteDirection: number
): void => {
  const d = rem(1 - absoluteDirection, Directions.NUM_DIRECTIONS) as Direction;
  const side2dLeftX = Side2Ds.faceSideNLeftX(face, absoluteDirection);
  const side2dLeftY = Side2Ds.faceSideNLeftY(face, absoluteDirection);
  const side2dRightX = Side2Ds.faceSideNRightX(face, absoluteDirection);
  const side2dRightY = Side2Ds.faceSideNRightY(face, absoluteDirection);
  resultLeft[partIndex] = Points.rotateX(side2dLeftX, side2dLeftY, d);
  resultRight[partIndex] = Points.rotateX(side2dRightX, side2dRightY, d);
  resultHeight[partIndex] = Points.rotateY(side2dLeftX, side2dLeftY, d);
}

export const normalizeSide2DBranchM = (
  resultLeft: SideCacheArray,
  resultRight: SideCacheArray,
  resultHeight: SideCacheArray,
  partIndex: number,
  branch: Branch,
  absoluteDirection: number
): void => {
  const d = rem(1 - absoluteDirection, Directions.NUM_DIRECTIONS) as Direction;
  const side2dLeftX = Side2Ds.branchSideNLeftX(branch, absoluteDirection);
  const side2dLeftY = Side2Ds.branchSideNLeftY(branch, absoluteDirection);
  const side2dRightX = Side2Ds.branchSideNRightX(branch, absoluteDirection);
  const side2dRightY = Side2Ds.branchSideNRightY(branch, absoluteDirection);
  resultLeft[partIndex] = Points.rotateX(side2dLeftX, side2dLeftY, d);
  resultRight[partIndex] = Points.rotateX(side2dRightX, side2dRightY, d);
  resultHeight[partIndex] = Points.rotateY(side2dLeftX, side2dLeftY, d);
}

export const normalizeFaceRelativeSide2DsM = (
  resultLeft: Array6<SideCacheArray>,
  resultRight: Array6<SideCacheArray>,
  resultHeight: Array6<SideCacheArray>,
  partIndex: number, face: Face
): void => {
  for (let i = 0; i < Directions.NUM_DIRECTIONS; ++i) {
    normalizeSide2DFaceM(resultLeft[i], resultRight[i], resultHeight[i], partIndex, face, i);
  }
}

export const normalizeBranchRelativeSide2DsM = (
  resultLeft: Array6<SideCacheArray>,
  resultRight: Array6<SideCacheArray>,
  resultHeight: Array6<SideCacheArray>,
  partIndex: number,
  branch: Branch
): void => {
  for (let i = 0; i < Directions.NUM_DIRECTIONS; ++i) {
    normalizeSide2DBranchM(resultLeft[i], resultRight[i], resultHeight[i], partIndex, branch, i);
  }
}