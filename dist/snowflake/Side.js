import * as Points from "../common/Point.js";
import * as Side2Ds from "./Side2D.js";
import { rem } from "../common/Utils.js";
import * as Directions from "./Direction.js";
export const normalizeSide2DFaceM = (resultLeft, resultRight, resultHeight, partIndex, centerX, centerY, size, absoluteDirection) => {
    const d = rem(1 - absoluteDirection, Directions.values.length);
    const side2dLeftX = Side2Ds.faceSideNLeftX(centerX, size, absoluteDirection);
    const side2dLeftY = Side2Ds.faceSideNLeftY(centerY, size, absoluteDirection);
    const side2dRightX = Side2Ds.faceSideNRightX(centerX, size, absoluteDirection);
    const side2dRightY = Side2Ds.faceSideNRightY(centerY, size, absoluteDirection);
    resultLeft[partIndex] = Points.rotateX(side2dLeftX, side2dLeftY, d);
    resultRight[partIndex] = Points.rotateX(side2dRightX, side2dRightY, d);
    resultHeight[partIndex] = Points.rotateY(side2dLeftX, side2dLeftY, d);
};
export const normalizeSide2DBranchM = (resultLeft, resultRight, resultHeight, partIndex, startX, startY, length, branchDirection, size, absoluteDirection) => {
    const d = rem(1 - absoluteDirection, Directions.values.length);
    const side2dLeftX = Side2Ds.branchSideNLeftX(startX, length, branchDirection, size, absoluteDirection);
    const side2dLeftY = Side2Ds.branchSideNLeftY(startY, length, branchDirection, size, absoluteDirection);
    const side2dRightX = Side2Ds.branchSideNRightX(startX, length, branchDirection, size, absoluteDirection);
    const side2dRightY = Side2Ds.branchSideNRightY(startY, length, branchDirection, size, absoluteDirection);
    resultLeft[partIndex] = Points.rotateX(side2dLeftX, side2dLeftY, d);
    resultRight[partIndex] = Points.rotateX(side2dRightX, side2dRightY, d);
    resultHeight[partIndex] = Points.rotateY(side2dLeftX, side2dLeftY, d);
};
export const normalizeFaceRelativeSide2DsM = (resultLeft, resultRight, resultHeight, partIndex, centerX, centerY, size) => {
    for (let i = 0; i < Directions.values.length; ++i) {
        normalizeSide2DFaceM(resultLeft[i], resultRight[i], resultHeight[i], partIndex, centerX, centerY, size, i);
    }
};
export const normalizeBranchRelativeSide2DsM = (resultLeft, resultRight, resultHeight, partIndex, startX, startY, length, branchDirection, size) => {
    for (let i = 0; i < Directions.values.length; ++i) {
        normalizeSide2DBranchM(resultLeft[i], resultRight[i], resultHeight[i], partIndex, startX, startY, length, branchDirection, size, i);
    }
};
export const overlapDistance = (height1, height2) => {
    return height1 - height2;
};
// Returns 'true' if the line segments l1...r1 and l2...r2 overlap.
export const overlaps = (l1, r1, l2, r2) => {
    // s1 ---......
    // s2       ......---
    //    and
    // s1       ......--- 
    // s2 ---......
    return l1 < r2 && l2 < r1;
};
//# sourceMappingURL=Side.js.map