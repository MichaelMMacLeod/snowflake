import * as Points from "../common/Point.js";
import * as Side2Ds from "./Side2D.js";
import { rem } from "../common/Utils.js";
import * as Directions from "./Direction.js";
export const normalizeSide2DFaceM = (resultLeft, resultRight, resultHeight, partIndex, face, absoluteDirection) => {
    const d = rem(1 - absoluteDirection, Directions.NUM_DIRECTIONS);
    const side2dLeftX = Side2Ds.faceSideNLeftX(face, absoluteDirection);
    const side2dLeftY = Side2Ds.faceSideNLeftY(face, absoluteDirection);
    const side2dRightX = Side2Ds.faceSideNRightX(face, absoluteDirection);
    const side2dRightY = Side2Ds.faceSideNRightY(face, absoluteDirection);
    resultLeft[partIndex] = Points.rotateX(side2dLeftX, side2dLeftY, d);
    resultRight[partIndex] = Points.rotateX(side2dRightX, side2dRightY, d);
    resultHeight[partIndex] = Points.rotateY(side2dLeftX, side2dLeftY, d);
};
export const normalizeSide2DBranchM = (resultLeft, resultRight, resultHeight, partIndex, branch, absoluteDirection) => {
    const d = rem(1 - absoluteDirection, Directions.NUM_DIRECTIONS);
    const side2dLeftX = Side2Ds.branchSideNLeftX(branch, absoluteDirection);
    const side2dLeftY = Side2Ds.branchSideNLeftY(branch, absoluteDirection);
    const side2dRightX = Side2Ds.branchSideNRightX(branch, absoluteDirection);
    const side2dRightY = Side2Ds.branchSideNRightY(branch, absoluteDirection);
    resultLeft[partIndex] = Points.rotateX(side2dLeftX, side2dLeftY, d);
    resultRight[partIndex] = Points.rotateX(side2dRightX, side2dRightY, d);
    resultHeight[partIndex] = Points.rotateY(side2dLeftX, side2dLeftY, d);
};
export const normalizeFaceRelativeSide2DsM = (resultLeft, resultRight, resultHeight, partIndex, face) => {
    for (let i = 0; i < Directions.NUM_DIRECTIONS; ++i) {
        normalizeSide2DFaceM(resultLeft[i], resultRight[i], resultHeight[i], partIndex, face, i);
    }
};
export const normalizeBranchRelativeSide2DsM = (resultLeft, resultRight, resultHeight, partIndex, branch) => {
    for (let i = 0; i < Directions.NUM_DIRECTIONS; ++i) {
        normalizeSide2DBranchM(resultLeft[i], resultRight[i], resultHeight[i], partIndex, branch, i);
    }
};
//# sourceMappingURL=Side.js.map