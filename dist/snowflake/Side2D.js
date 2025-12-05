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
export const faceSideNLeftX = (centerX, size, absoluteSideIndex) => {
    return Faces.pointNX(centerX, size, (absoluteSideIndex + 1) % Directions.values.length);
};
export const faceSideNLeftY = (centerY, size, absoluteSideIndex) => {
    return Faces.pointNY(centerY, size, (absoluteSideIndex + 1) % Directions.values.length);
};
export const faceSideNRightX = (centerX, size, absoluteSideIndex) => {
    return Faces.pointNX(centerX, size, absoluteSideIndex);
};
export const faceSideNRightY = (centerY, size, absoluteSideIndex) => {
    return Faces.pointNY(centerY, size, absoluteSideIndex);
};
export const branchSideNLeftX = (startX, length, branchDirection, size, absoluteSideIndex) => {
    return Branches.pointNX(startX, length, branchDirection, size, (absoluteSideIndex + 1) % Directions.values.length);
};
export const branchSideNLeftY = (startY, length, branchDirection, size, absoluteSideIndex) => {
    return Branches.pointNY(startY, length, branchDirection, size, (absoluteSideIndex + 1) % Directions.values.length);
};
export const branchSideNRightX = (startX, length, branchDirection, size, absoluteSideIndex) => {
    return Branches.pointNX(startX, length, branchDirection, size, absoluteSideIndex);
};
export const branchSideNRightY = (startY, length, branchDirection, size, absoluteSideIndex) => {
    return Branches.pointNY(startY, length, branchDirection, size, absoluteSideIndex);
};
//# sourceMappingURL=Side2D.js.map