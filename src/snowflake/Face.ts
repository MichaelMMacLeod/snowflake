import { midpointTN } from "../common/Point.js";
import { Direction } from "./Direction.js";
import * as Directions from "./Direction.js";
import { _graphic_ctx, Graphic } from "./Graphic.js";
import { outsideVisibleArea, viewspaceX, viewspaceY } from "./CoordinateSystem.js";
import { faceSizeGrowthScalar } from "../common/Constants.js";

export const _face_centerX = 0;
export const _face_centerY = 1;
export const _face_size = 2;
export const _face_direction = 3;
export const _face_growthScale = 4;
export const _face_growing = 5;
export type Face = {
    [_face_centerX]: number,
    [_face_centerY]: number,
    [_face_size]: number,
    [_face_direction]: Direction,
    [_face_growthScale]: number,
    [_face_growing]: boolean,
};

const SIZE_ZERO = 0.0025;

export const zero = (): Face => {
    const centerX = 0;
    const centerY = 0;
    const size = SIZE_ZERO;
    const direction = 0;
    const growthScale = 1;
    const growing = true;
    return [
        centerX,
        centerY,
        size,
        direction,
        growthScale,
        growing,
    ];
};

export const zeroM = (f: Face): void => {
    f[_face_centerX] = 0;
    f[_face_centerY] = 0;
    f[_face_size] = SIZE_ZERO;
    f[_face_direction] = 0;
    f[_face_growthScale] = 1;
    f[_face_growing] = true;
}

export const manualPointNX = (centerX: number, size: number, absoluteDirection: number): number => {
    return centerX + size * Directions.cosines[absoluteDirection];
}

export const manualPointNY = (centerY: number, size: number, absoluteDirection: number): number => {
    return centerY + size * Directions.sines[absoluteDirection];
}

export const pointNX = (f: Face, absoluteDirection: number): number => {
    return manualPointNX(f[_face_centerX], f[_face_size], absoluteDirection);
}

export const pointNY = (f: Face, absoluteDirection: number): number => {
    return manualPointNY(f[_face_centerY], f[_face_size], absoluteDirection);
}

export const draw = (g: Graphic, f: Face, faceIndex: number): boolean => {
    const d = f[_face_direction];
    const p0x = viewspaceX(g, pointNX(f, (d + 0) % 6));
    const p0y = viewspaceY(g, pointNY(f, (d + 0) % 6));
    const p1x = viewspaceX(g, pointNX(f, (d + 1) % 6));
    const p1y = viewspaceY(g, pointNY(f, (d + 1) % 6));
    const p2x = viewspaceX(g, pointNX(f, (d + 2) % 6));
    const p2y = viewspaceY(g, pointNY(f, (d + 2) % 6));
    const p3x = viewspaceX(g, pointNX(f, (d + 3) % 6));
    const p3y = viewspaceY(g, pointNY(f, (d + 3) % 6));
    const p4x = viewspaceX(g, pointNX(f, (d + 4) % 6));
    const p4y = viewspaceY(g, pointNY(f, (d + 4) % 6));
    const p5x = viewspaceX(g, pointNX(f, (d + 5) % 6));
    const p5y = viewspaceY(g, pointNY(f, (d + 5) % 6));
    if (outsideVisibleArea(g, p0x)
        || outsideVisibleArea(g, p1x)
        || outsideVisibleArea(g, p2x)
        || outsideVisibleArea(g, p3x)
        || outsideVisibleArea(g, p4x)
        || outsideVisibleArea(g, p5x)
        || outsideVisibleArea(g, p0y)
        || outsideVisibleArea(g, p1y)
        || outsideVisibleArea(g, p2y)
        || outsideVisibleArea(g, p3y)
        || outsideVisibleArea(g, p4y)
        || outsideVisibleArea(g, p5y)
    ) {
        return true;
    }
    const ctx = g[_graphic_ctx];
    if (faceIndex === 0) {
        const cx = viewspaceX(g, f[_face_centerX]);
        const cy = viewspaceY(g, f[_face_centerY]);
        ctx.moveTo(p0x, p0y);
        ctx.lineTo(p1x, p1y);
        ctx.lineTo(p2x, p2y);
        ctx.lineTo(p3x, p3y);
        ctx.lineTo(p4x, p4y);
        ctx.lineTo(p5x, p5y);
        ctx.lineTo(p0x, p0y);

        ctx.moveTo(cx, cy);
        ctx.lineTo(p0x, p0y);
        ctx.moveTo(cx, cy);
        ctx.lineTo(p1x, p1y);
        ctx.moveTo(cx, cy);
        ctx.lineTo(p2x, p2y);
        ctx.moveTo(cx, cy);
        ctx.lineTo(p3x, p3y);
        ctx.moveTo(cx, cy);
        ctx.lineTo(p4x, p4y);
        ctx.moveTo(cx, cy);
        ctx.lineTo(p5x, p5y);
    } else {
        const p31x = midpointTN(p3x, p1x, 0.6);
        const p31y = midpointTN(p3y, p1y, 0.6);
        const p30x = midpointTN(p3x, p0x, 0.6);
        const p30y = midpointTN(p3y, p0y, 0.6);
        const p35x = midpointTN(p3x, p5x, 0.6);
        const p35y = midpointTN(p3y, p5y, 0.6);
        const p45x = midpointTN(p4x, p5x, 0.6);
        const p45y = midpointTN(p4y, p5y, 0.6);
        const p21x = midpointTN(p2x, p1x, 0.6);
        const p21y = midpointTN(p2y, p1y, 0.6);
        ctx.moveTo(p45x, p45y);
        ctx.lineTo(p5x, p5y);
        ctx.moveTo(p21x, p21y);
        ctx.lineTo(p1x, p1y);
        ctx.moveTo(p5x, p5y);
        ctx.lineTo(p0x, p0y);
        ctx.lineTo(p1x, p1y)
        ctx.moveTo(p31x, p31y);
        ctx.lineTo(p1x, p1y);
        ctx.moveTo(p30x, p30y)
        ctx.lineTo(p0x, p0y);
        ctx.moveTo(p35x, p35y);
        ctx.lineTo(p5x, p5y);
    }
    return false;
}

export const enlarge = (f: Face, faceIndex: number, scale: number): void => {
    f[_face_size] += scale * faceSizeGrowthScalar * f[_face_growthScale];
    if (faceIndex !== 0) {
        const dx = scale * faceSizeGrowthScalar * Math.cos(Directions.values[f[_face_direction]]) * f[_face_growthScale];
        const dy = scale * faceSizeGrowthScalar * Math.sin(Directions.values[f[_face_direction]]) * f[_face_growthScale];
        f[_face_centerX] += dx;
        f[_face_centerY] += dy;
    }
}