import * as Faces from "./Face.js";
import * as Branches from "./Branch.js";
import * as Directions from "./Direction.js";
// The functions in this file return coordinates of endpoints of lines in a part.
// The nth side of a part is defined in the following way:
//         1
//       -----
//    2 /     \  0
//     /       \
//     \       /
//   3  \     /  5
//       -----
//         4
// The 'left' point on a side is the one that is more counterclockwise. So, for
// example, the left point of side zero is the right point of side one.
//
// These functions do not take into consideration the 'direction' of the parts.
export const faceSideNLeftX = (face, absoluteSideIndex) => {
    return Faces.pointNX(face, (absoluteSideIndex + 1) % Directions.NUM_DIRECTIONS);
};
export const faceSideNLeftY = (face, absoluteSideIndex) => {
    return Faces.pointNY(face, (absoluteSideIndex + 1) % Directions.NUM_DIRECTIONS);
};
export const faceSideNRightX = (face, absoluteSideIndex) => {
    return Faces.pointNX(face, absoluteSideIndex);
};
export const faceSideNRightY = (face, absoluteSideIndex) => {
    return Faces.pointNY(face, absoluteSideIndex);
};
export const branchSideNLeftX = (branch, absoluteSideIndex) => {
    return Branches.pointNX(branch, (absoluteSideIndex + 1) % Directions.NUM_DIRECTIONS);
};
export const branchSideNLeftY = (branch, absoluteSideIndex) => {
    return Branches.pointNY(branch, (absoluteSideIndex + 1) % Directions.NUM_DIRECTIONS);
};
export const branchSideNRightX = (branch, absoluteSideIndex) => {
    return Branches.pointNX(branch, absoluteSideIndex);
};
export const branchSideNRightY = (branch, absoluteSideIndex) => {
    return Branches.pointNY(branch, absoluteSideIndex);
};
//# sourceMappingURL=Side2D.js.map