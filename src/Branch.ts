import * as Points from "./Point";
import { Point } from "./Point";
import { Direction } from "./Direction";
import * as Directions from "./Direction";
import { Graphic } from "./Graphic";
import { worldToViewTransform } from "./CoordinateSystem";
import * as Faces from "./Face";
import { Face } from "./Face";
import { growthScalar, branchGrowthScalar } from "./Constants";

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

function points(branch: Branch): Array<Point> {
    const result: Array<Point> = [];
    const startPoints = Faces.points(startFace(branch));
    const endPoints = Faces.points(endFace(branch));
    result.push(endPoints[0]);
    result.push(endPoints[1]);
    result.push(startPoints[2]);
    result.push(startPoints[3]);
    result.push(startPoints[4]);
    result.push(endPoints[5]);
    return result;
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
    graphic.ctx.fill();
}

export function enlarge(branch : Branch, scale: number): void {
    const lengthScalar = -1.5 * scale + 1.5;
    const sizeScalar = 1.5 * scale;
    branch.size += sizeScalar * branchGrowthScalar * branch.growthScale;
    branch.length += lengthScalar * growthScalar * branch.growthScale;
}
