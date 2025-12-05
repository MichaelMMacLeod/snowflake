import { Face } from "./Face.js";
import * as Faces from "./Face.js";
import { Branch } from "./Branch.js";
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

export const faceSideNLeftX = (face: Face, absoluteSideIndex: number): number => {
    return Faces.pointNX(face, (absoluteSideIndex + 1) % Directions.values.length);
}

export const faceSideNLeftY = (face: Face, absoluteSideIndex: number): number => {
    return Faces.pointNY(face, (absoluteSideIndex + 1) % Directions.values.length);
}

export const faceSideNRightX = (face: Face, absoluteSideIndex: number): number => {
    return Faces.pointNX(face, absoluteSideIndex);
}

export const faceSideNRightY = (face: Face, absoluteSideIndex: number): number => {
    return Faces.pointNY(face, absoluteSideIndex);
}

export const branchSideNLeftX = (branch: Branch, absoluteSideIndex: number): number => {
    return Branches.pointNX(branch, (absoluteSideIndex + 1) % Directions.values.length);
}

export const branchSideNLeftY = (branch: Branch, absoluteSideIndex: number): number => {
    return Branches.pointNY(branch, (absoluteSideIndex + 1) % Directions.values.length);
}

export const branchSideNRightX = (branch: Branch, absoluteSideIndex: number): number => {
    return Branches.pointNX(branch, absoluteSideIndex);
}

export const branchSideNRightY = (branch: Branch, absoluteSideIndex: number): number => {
    return Branches.pointNY(branch, absoluteSideIndex);
}
