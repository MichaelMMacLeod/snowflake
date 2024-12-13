import * as Points from "./Point";
import { drawLine, midpoint, midpointT, Point } from "./Point";
import { Direction } from "./Direction";
import * as Directions from "./Direction";
import { callWithViewspacePoints, Graphic } from "./Graphic";
import { worldToViewTransform, worldToViewTransformGuarded } from "./CoordinateSystem";
import { faceSizeGrowthScalar } from "./Constants";
import { Array6, makeArray6, rem } from "./Utils";

export type Face = {
    center: Point,
    size: number,
    isFirstFace: boolean,
    direction: Direction,
    growthScale: number,
    growing: boolean,
};

export function zero(): Face {
    return {
        center: Points.zero(),
        size: 0.0025,
        isFirstFace: true,
        direction: 0,
        growthScale: 1,
        growing: true,
    }
};

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
    const result: Array6<Point> = makeArray6(Points.zero);
    for (let i = 0; i < Directions.values.length; i += 1) {
        setPointN(result[i], face, i);
    }
    return result;
}

function setPointN(result: Point, face: Face, i: number) {
    const d = (face.direction + i) % Directions.values.length;
    result.x = face.center.x + face.size * Directions.cosines[d];
    result.y = face.center.y + face.size * Directions.sines[d];
}

export function draw(graphic: Graphic, face: Face): boolean {
    return callWithViewspacePoints(
        graphic,
        () => points(face),
        () => true,
        (ps => {
            const [p0, p1, p2, p3, p4, p5] = ps;

            const p31 = midpointT(p3, p1, 0.6);
            const p30 = midpointT(p3, p0, 0.6);
            const p35 = midpointT(p3, p5, 0.6);
            const p45 = midpointT(p4, p5, 0.6);
            const p21 = midpointT(p2, p1, 0.6);

            if (face.isFirstFace) {
                graphic.ctx.strokeStyle = `rgba(255, 255, 255, 0.08)`;
                graphic.ctx.beginPath();
                ps.forEach((p, i) => {
                    const { x, y } = p;
                    if (i === 0) {
                        graphic.ctx.moveTo(x, y);
                    } else {
                        graphic.ctx.lineTo(x, y);
                    }
                });
                graphic.ctx.closePath();
                graphic.ctx.stroke();

                const c = worldToViewTransform(graphic, face.center);
                ps.forEach(p => {
                    drawLine(graphic.ctx, c, p);
                });
            } else {
                graphic.ctx.strokeStyle = `rgba(255, 255, 255, 0.08)`;

                drawLine(graphic.ctx, p45, p5);
                drawLine(graphic.ctx, p21, p1);

                for (let i = 0; i < 3; ++i) {
                    const { x, y } = ps[rem(i - 1, ps.length)];
                    if (i === 0) {
                        graphic.ctx.moveTo(x, y);
                    } else {
                        graphic.ctx.lineTo(x, y);
                    }
                };
                graphic.ctx.stroke();

                drawLine(graphic.ctx, p31, p1);
                drawLine(graphic.ctx, p30, p0);
                drawLine(graphic.ctx, p35, p5);
            }

            return false;
        })
    );
}

export function enlarge(face: Face, scale: number): void {
    face.size += scale * faceSizeGrowthScalar * face.growthScale;
    if (!face.isFirstFace) {
        const dx = scale * faceSizeGrowthScalar * Math.cos(Directions.values[face.direction]) * face.growthScale;
        const dy = scale * faceSizeGrowthScalar * Math.sin(Directions.values[face.direction]) * face.growthScale;
        face.center.x += dx;
        face.center.y += dy;
    }
}