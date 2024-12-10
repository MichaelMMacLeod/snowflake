import * as Points from "./Point";
import { Point } from "./Point";
import { Direction } from "./Direction";
import * as Directions from "./Direction";
import { Graphic } from "./Graphic";
import { worldToViewTransform } from "./CoordinateSystem";
import * as Faces from "./Face";
import { Face } from "./Face";
import { growthScalar, branchGrowthScalar } from "./Constants";
import { Array6, rem } from "./Utils";

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
    const startPoints = Faces.points(startFace(branch));
    const endPoints = Faces.points(endFace(branch));
    return [
        endPoints[0],
        endPoints[1],
        startPoints[2],
        startPoints[3],
        startPoints[4],
        endPoints[5],
    ];
}

export function draw(graphic: Graphic, branch: Branch): void {
    graphic.ctx.beginPath();
    const ps = points(branch);
    for (let i = 0; i < 3; ++i) {
        const { x, y } = worldToViewTransform(graphic, ps[rem(i - 1, ps.length)]);
        if (i === 0) {
            graphic.ctx.moveTo(x, y);
        } else {
            graphic.ctx.lineTo(x, y);
        }
    }
    graphic.ctx.strokeStyle = `rgba(255, 255, 255, 0.1)`;
    graphic.ctx.stroke();

    graphic.ctx.strokeStyle = `rgba(255, 255, 255, 0.05)`;

    graphic.ctx.beginPath();
    const p4 = worldToViewTransform(graphic, ps[4]);
    graphic.ctx.moveTo(p4.x, p4.y);
    const p5 = worldToViewTransform(graphic, ps[5]);
    graphic.ctx.lineTo(p5.x, p5.y);
    graphic.ctx.stroke();

    graphic.ctx.beginPath();
    const p1 = worldToViewTransform(graphic, ps[1]);
    graphic.ctx.moveTo(p1.x, p1.y);
    const p2 = worldToViewTransform(graphic, ps[2]);
    graphic.ctx.lineTo(p2.x, p2.y);
    graphic.ctx.stroke();

    graphic.ctx.strokeStyle = `rgba(255, 255, 255, 0.1)`;

    graphic.ctx.beginPath();
    const p0 = worldToViewTransform(graphic, ps[0]);
    graphic.ctx.moveTo(p0.x, p0.y);
    const p3 = worldToViewTransform(graphic, Points.scale(ps[0], 0.95));
    graphic.ctx.lineTo(p3.x, p3.y);
    graphic.ctx.stroke();
}

export function enlarge(branch: Branch, scale: number): void {
    const lengthScalar = -1.5 * scale + 1.5;
    const sizeScalar = 1.5 * scale;
    branch.size += sizeScalar * branchGrowthScalar * branch.growthScale;
    branch.length += lengthScalar * growthScalar * branch.growthScale;
}
