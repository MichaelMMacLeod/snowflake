import * as Points from "./Point";
import { Point } from "./Point";
import { Direction } from "./Direction";
import * as Directions from "./Direction";
import { Graphic } from "./Graphic";
import { worldToViewTransform } from "./CoordinateSystem";
import { growthScalar } from "./Constants";
import { Array6, makeArray6 } from "./Utils";

export type Face = {
    center: Point,
    size: number,

    // The 'seed' face is the only one which a direction of none.
    // It is the only face which sprouts 6 branches. All other faces
    // sprout 3 branches in their direction.
    direction: Direction | 'none',

    growthScale: number,
    growing: boolean,
};

export function zero(): Face {
    return {
        center: Points.zero(),
        size: 0.0025,
        direction: 'none',
        growthScale: 1,
        growing: true,
    }
};

export function direction(face: Face): Direction {
    return face.direction === "none" ? 0 : face.direction;
}

// Points are returned in order of relative direction:
//
//      [2]-----[1]
//      /         \
//     /           \
//   [3]           [0] --- direction --->
//     \           /
//      \         /
//      [4]-----[5]
export function points(face: Face): Array6<Point> {
    const dir: Direction = face.direction === 'none' ? 0 : face.direction;
    const result: Array6<Point> = makeArray6(Points.zero);
    for (let i = 0; i < Directions.values.length; i += 1) {
        const d = Directions.values[(dir + i) % Directions.values.length];
        result[i].x = face.center.x + face.size * Math.cos(d);
        result[i].y = face.center.y + face.size * Math.sin(d);
    }
    return result;
}

export function draw(graphic: Graphic, face: Face): void {
    const dir = face.direction === "none" ? 0 : face.direction;
    graphic.ctx.beginPath();
    points(face).forEach((p, i) => {
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

export function enlarge(face: Face, scale: number): void {
    face.size += 0.75 * scale * growthScalar * face.growthScale;
    if (face.direction !== 'none') {
        const dx = 0.75 * 1 * scale * growthScalar * Math.cos(Directions.values[face.direction]) * face.growthScale;
        const dy = 0.75 * 1 * scale * growthScalar * Math.sin(Directions.values[face.direction]) * face.growthScale;
        face.center.x += dx;
        face.center.y += dy;
    }
}