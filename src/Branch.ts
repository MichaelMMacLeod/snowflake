import * as Points from "./Point";
import { drawLine, midpoint, midpointT, Point } from "./Point";
import { Direction } from "./Direction";
import * as Directions from "./Direction";
import { callWithViewspacePoints, Graphic } from "./Graphic";
import { worldToViewTransform } from "./CoordinateSystem";
import * as Faces from "./Face";
import { Face } from "./Face";
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

export function end(branch: Branch): Point {
    let d = Directions.values[branch.direction];
    let l = branch.length;
    let x = branch.start.x + l * Math.cos(d);
    let y = branch.start.y + l * Math.sin(d);
    return { x, y };
}

function startFace(branch: Branch): Face {
    return {
        ...Faces.zero(),
        isFirstFace: false,
        center: Points.copy(branch.start),
        size: branch.size,
        direction: branch.direction,
    };
}

function endFace(branch: Branch): Face {
    return {
        ...Faces.zero(),
        center: Points.add(
            branch.start,
            {
                x: branch.length * Math.cos(Directions.values[branch.direction]),
                y: branch.length * Math.sin(Directions.values[branch.direction]),
            }),
        size: branch.size,
        direction: branch.direction,
    };
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
    const sf = startFace(branch);
    const ef = endFace(branch);
    const result = makeArray6(Points.zero);
    Faces.setPointN(result[0], ef, 0);
    Faces.setPointN(result[1], ef, 1);
    Faces.setPointN(result[2], sf, 2);
    Faces.setPointN(result[3], sf, 3);
    Faces.setPointN(result[4], sf, 4);
    Faces.setPointN(result[5], ef, 5);
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
            ctx.lineTo(p0.x,p0.y);
            ctx.lineTo(p1.x,p1.y);
            ctx.moveTo(p45.x,p45.y);
            ctx.lineTo(p5.x,p5.y);
            ctx.moveTo(p21.x,p21.y);
            ctx.lineTo(p1.x,p1.y);
            ctx.moveTo(p0.x,p0.y);
            ctx.lineTo(p3.x,p3.y);

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
