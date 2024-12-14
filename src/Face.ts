import * as Points from "./Point";
import { drawLine, drawSeparateLines, midpoint, midpointT, Point } from "./Point";
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

export function setPointN(result: Point, face: Face, i: number) {
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

            const ctx = graphic.ctx;
            if (face.isFirstFace) {
                const c = worldToViewTransform(graphic, face.center);
                ctx.moveTo(p0.x, p0.y);
                ctx.lineTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.lineTo(p3.x, p3.y);
                ctx.lineTo(p4.x, p4.y);
                ctx.lineTo(p5.x, p5.y);
                ctx.lineTo(p0.x, p0.y);

                ctx.moveTo(c.x, c.y);
                ctx.lineTo(p0.x, p0.y);
                ctx.moveTo(c.x, c.y);
                ctx.lineTo(p1.x, p1.y);
                ctx.moveTo(c.x, c.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.moveTo(c.x, c.y);
                ctx.lineTo(p3.x, p3.y);
                ctx.moveTo(c.x, c.y);
                ctx.lineTo(p4.x, p4.y);
                ctx.moveTo(c.x, c.y);
                ctx.lineTo(p5.x, p5.y);
            } else {
                ctx.moveTo(p45.x, p45.y);
                ctx.lineTo(p5.x, p5.y);
                ctx.moveTo(p21.x, p21.y);
                ctx.lineTo(p1.x, p1.y);
                ctx.moveTo(p5.x, p5.y);
                ctx.lineTo(p0.x, p0.y);
                ctx.lineTo(p1.x, p1.y)
                ctx.moveTo(p31.x, p31.y);
                ctx.lineTo(p1.x, p1.y);
                ctx.moveTo(p30.x, p30.y)
                ctx.lineTo(p0.x, p0.y);
                ctx.moveTo(p35.x, p35.y);
                ctx.lineTo(p5.x, p5.y);
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