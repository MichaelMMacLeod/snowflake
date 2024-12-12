import * as Points from "./Point";
import { Point } from "./Point";
import { Direction } from "./Direction";
import * as Directions from "./Direction";
import { Graphic } from "./Graphic";
import { worldToViewTransform } from "./CoordinateSystem";
import { growthScalar } from "./Constants";
import { Array6, makeArray6, rem } from "./Utils";

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
    const ps = points(face);
    const tps = ps.map(p => worldToViewTransform(graphic, p));
    const p0 = worldToViewTransform(graphic, ps[0]);
    const p1 = worldToViewTransform(graphic, ps[1]);
    const p2 = worldToViewTransform(graphic, ps[2]);
    const p3 = worldToViewTransform(graphic, ps[3]);
    const p4 = worldToViewTransform(graphic, ps[4]);
    const p5 = worldToViewTransform(graphic, ps[5]);

    const p31 = worldToViewTransform(graphic, Points.midpointT(ps[3], ps[1], 0.2));
    const p30 = worldToViewTransform(graphic, Points.midpointT(ps[3], ps[0], 0.2));
    const p35 = worldToViewTransform(graphic, Points.midpointT(ps[3], ps[5], 0.2));

    if (face.direction === "none") {
        graphic.ctx.strokeStyle = `rgba(255, 255, 255, 0.08)`;
        ps.forEach((p, i) => {
            const { x, y } = worldToViewTransform(graphic, p);
            if (i === 0) {
                graphic.ctx.moveTo(x, y);
            } else {
                graphic.ctx.lineTo(x, y);
            }
        });
        graphic.ctx.closePath();
        graphic.ctx.stroke();

        const c = worldToViewTransform(graphic, face.center);
        tps.forEach(p => {
            graphic.ctx.beginPath();
            graphic.ctx.moveTo(c.x, c.y);
            graphic.ctx.lineTo(p.x, p.y);
            graphic.ctx.stroke();
        });
    } else {

        graphic.ctx.strokeStyle = `rgba(255, 255, 255, 0.08)`;

        graphic.ctx.beginPath();
        const p45 = worldToViewTransform(graphic, Points.midpoint(ps[4], ps[5]));
        graphic.ctx.moveTo(p45.x, p45.y);
        graphic.ctx.lineTo(p5.x, p5.y);
        graphic.ctx.stroke();

        graphic.ctx.beginPath();
        const p21 = worldToViewTransform(graphic, Points.midpoint(ps[2], ps[1]));
        graphic.ctx.moveTo(p21.x, p21.y);
        graphic.ctx.lineTo(p1.x, p1.y);
        graphic.ctx.stroke();

        for (let i = 0; i < 3; ++i) {
            const { x, y } = worldToViewTransform(graphic, ps[rem(i - 1, ps.length)]);
            if (i === 0) {
                graphic.ctx.moveTo(x, y);
            } else {
                graphic.ctx.lineTo(x, y);
            }
        };
        graphic.ctx.stroke();

        graphic.ctx.beginPath();
        graphic.ctx.moveTo(p31.x, p31.y);
        graphic.ctx.lineTo(p1.x, p1.y);
        graphic.ctx.stroke();

        graphic.ctx.beginPath();
        graphic.ctx.moveTo(p30.x, p30.y);
        graphic.ctx.lineTo(p0.x, p0.y);
        graphic.ctx.stroke();

        graphic.ctx.beginPath();
        graphic.ctx.moveTo(p35.x, p35.y);
        graphic.ctx.lineTo(p5.x, p5.y);
        graphic.ctx.stroke();
    }
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