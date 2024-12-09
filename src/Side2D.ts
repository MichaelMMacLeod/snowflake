import { Face } from "./Face";
import * as Faces from "./Face";
import * as Directions from "./Direction";
import { Point } from "./Point";
import * as Points from "./Point";
import { Branch } from "./Branch";
import * as Branches from "./Branch";
import { Array6, makeArray6 } from "./Utils";

export type Side2D = {
    left: Point,
    right: Point,
}

export function zero(): Side2D {
    return { left: Points.zero(), right: Points.zero() }
}

function ofPoints(points: Array6<Point>): Array6<Side2D> {
    const result: Array6<Side2D> = makeArray6(zero);
    for (let i = 0; i < Directions.values.length; i += 1) {
        result[i].left = points[(i + 1) % Directions.values.length];
        result[i].right = points[i];
    }
    return result;
}

// Side2Ds are returned in relative order:
//         1
//       -----
//    2 /     \  0
//     /       \ _____direction___>
//     \       /
//   3  \     /  5
//       -----
//         4
export function ofFace(face: Face): Array6<Side2D> {
    return ofPoints(Faces.points(face));
}

// Side2Ds are returned in relative order:
//               1
//       -----------------
//    2 /                 \  0
//     /                   \ _____direction___>
//     \                   /
//   3  \                 /  5
//       -----------------
//               4
export function ofBranch(branch: Branch): Array6<Side2D> {
    return ofPoints(Branches.points(branch));
}
