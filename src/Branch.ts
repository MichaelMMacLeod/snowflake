import * as Points from "./Point";
import { Point } from "./Point";
import { Direction } from "./Direction";
import * as Directions from "./Direction";
import { Graphic } from "./Graphic";
import { worldToViewTransform } from "./CoordinateSystem";
import * as Faces from "./Face";
import { Face } from "./Face";
import { growthScalar, branchGrowthScalar } from "./Constants";
import { Array6 } from "./Utils";

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
    points(branch).forEach((p, i) => {
        const { x, y } = worldToViewTransform(graphic, p);
        if (i === 0) {
            graphic.ctx.moveTo(x, y);
        } else {
            graphic.ctx.lineTo(x, y);
        }
    });
    graphic.ctx.closePath();
    graphic.ctx.fillStyle = `rgba(255, 255, 255, 1)`;
    graphic.ctx.fill();
}

export function enlarge(branch: Branch, scale: number): void {
    const lengthScalar = -1.5 * scale + 1.5;
    const sizeScalar = 1.5 * scale;
    branch.size += sizeScalar * branchGrowthScalar * branch.growthScale;
    branch.length += lengthScalar * growthScalar * branch.growthScale;
}
