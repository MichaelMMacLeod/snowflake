import * as Points from "./Point";
import { midpointT, Point } from "./Point";
import { Direction } from "./Direction";
import * as Directions from "./Direction";
import { callWithViewspacePoints, Graphic } from "./Graphic";
import { worldToViewTransform } from "./CoordinateSystem";
import * as Faces from "./Face";
import { Face, setPointNManually } from "./Face";
import { branchLengthGrowthScalar, branchSizeGrowthScalar } from "./Constants";
import { Array6, makeArray6, rem } from "./Utils";

export type Branch = {
    start: Point,
    size: number,
    length: number,
    direction: Direction,
    growthScale: number,
    growing: boolean,
}

export function endCenterX(branch: Branch): number {
    return branch.start.x + branch.length * Directions.cosines[branch.direction];
}

export function endCenterY(branch: Branch): number {
    return branch.start.y + branch.length * Directions.sines[branch.direction];
}

export function pointNX(branch: Branch, absoluteDirection: number): number {
    const d = rem(absoluteDirection - branch.direction, Directions.values.length);
    if (d === 5 || d === 0 || d === 1) {
        return Faces.manualPointNX(endCenterX(branch), branch.size, absoluteDirection);
    }
    return Faces.manualPointNX(branch.start.x, branch.size, absoluteDirection);
}

export function pointNY(branch: Branch, absoluteDirection: number): number {
    const d = rem(absoluteDirection - branch.direction, Directions.values.length);
    if (d === 5 || d === 0 || d === 1) {
        return Faces.manualPointNY(endCenterY(branch), branch.size, absoluteDirection);
    }
    return Faces.manualPointNY(branch.start.y, branch.size, absoluteDirection);
}

export function end(branch: Branch): Point {
    let l = branch.length;
    let x = branch.start.x + l * Directions.cosines[branch.direction];
    let y = branch.start.y + l * Directions.sines[branch.direction];
    return { x, y };
}

function setPointNManuallyStartFace(branch: Branch, result: Point, i: number) {
    const direction = branch.direction;
    const center = branch.start;
    const size = branch.size;
    setPointNManually(result, direction, center, size, i)
}

function setPointNManuallyEndFace(branch: Branch, result: Point, i: number, endFaceCenter: Point) {
    const direction = branch.direction;
    const size = branch.size;
    setPointNManually(result, direction, endFaceCenter, size, i)
}

// Points are returned in order of relative direction:
//
//      [2]------------------------------[1]
//      /                                  \
//     /                                    \
//   [3]                                    [0] --- direction --->
//     \                                    /
//      \                                  /
//      [4]------------------------------[5]
export function points(branch: Branch): Array6<Point> {
    const result = makeArray6(Points.zero);
    const endFaceCenter = end(branch);
    setPointNManuallyEndFace(branch, result[0], 0, endFaceCenter);
    setPointNManuallyEndFace(branch, result[1], 1, endFaceCenter);
    setPointNManuallyStartFace(branch, result[2], 2);
    setPointNManuallyStartFace(branch, result[3], 3);
    setPointNManuallyStartFace(branch, result[4], 4);
    setPointNManuallyEndFace(branch, result[5], 5, endFaceCenter);
    return result;
}

export function draw(graphic: Graphic, branch: Branch): boolean {
    return callWithViewspacePoints(
        graphic,
        () => points(branch),
        () => true,
        (ps => {
            const [p0, p1, p2, p3, p4, p5] = ps;
            const p45 = midpointT(p4, p5, 0.6);
            const p21 = midpointT(p2, p1, 0.6);

            const ctx = graphic.ctx;
            ctx.moveTo(p5.x, p5.y);
            ctx.lineTo(p0.x, p0.y);
            ctx.lineTo(p1.x, p1.y);
            ctx.moveTo(p45.x, p45.y);
            ctx.lineTo(p5.x, p5.y);
            ctx.moveTo(p21.x, p21.y);
            ctx.lineTo(p1.x, p1.y);
            ctx.moveTo(p0.x, p0.y);
            ctx.lineTo(p3.x, p3.y);

            return false;
        })
    );
}

export function enlarge(branch: Branch, scale: number): void {
    // const lengthScalar = -1.5 * scale + 1.5;
    // const sizeScalar = 1.5 * scale;
    branch.size += branchSizeGrowthScalar * branch.growthScale;
    branch.length += branchLengthGrowthScalar * branch.growthScale;
}
