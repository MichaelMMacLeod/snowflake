import { midpointTN } from "../common/Point.js";
import * as Directions from "./Direction.js";
import { _graphic_ctx } from "./Graphic.js";
import { outsideVisibleArea, viewspaceX, viewspaceY } from "./CoordinateSystem.js";
import { faceSizeGrowthScalar } from "../common/Constants.js";
export const _face_centerX = 0;
export const _face_centerY = 1;
export const _face_size = 2;
export const _face_direction = 3;
export const _face_growthScale = 4;
export const _face_growing = 5;
const SIZE_ZERO = 0.0025;
export const zero = () => {
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
export const zeroM = (f) => {
    f[_face_centerX] = 0;
    f[_face_centerY] = 0;
    f[_face_size] = SIZE_ZERO;
    f[_face_direction] = 0;
    f[_face_growthScale] = 1;
    f[_face_growing] = true;
};
export const manualPointNX = (centerX, size, absoluteDirection) => {
    return centerX + size * Directions.cosines[absoluteDirection];
};
export const manualPointNY = (centerY, size, absoluteDirection) => {
    return centerY + size * Directions.sines[absoluteDirection];
};
export const pointNX = (f, absoluteDirection) => {
    return manualPointNX(f[_face_centerX], f[_face_size], absoluteDirection);
};
export const pointNY = (f, absoluteDirection) => {
    return manualPointNY(f[_face_centerY], f[_face_size], absoluteDirection);
};
export const draw = (g, f, faceIndex) => {
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
        || outsideVisibleArea(g, p5y)) {
        return true;
    }
    const ctx = g[_graphic_ctx];
    const moveTo = ctx.moveTo.bind(ctx);
    const lineTo = ctx.lineTo.bind(ctx);
    if (faceIndex === 0) {
        const cx = viewspaceX(g, f[_face_centerX]);
        const cy = viewspaceY(g, f[_face_centerY]);
        moveTo(p0x, p0y);
        lineTo(p1x, p1y);
        lineTo(p2x, p2y);
        lineTo(p3x, p3y);
        lineTo(p4x, p4y);
        lineTo(p5x, p5y);
        lineTo(p0x, p0y);
        moveTo(cx, cy);
        lineTo(p0x, p0y);
        moveTo(cx, cy);
        lineTo(p1x, p1y);
        moveTo(cx, cy);
        lineTo(p2x, p2y);
        moveTo(cx, cy);
        lineTo(p3x, p3y);
        moveTo(cx, cy);
        lineTo(p4x, p4y);
        moveTo(cx, cy);
        lineTo(p5x, p5y);
    }
    else {
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
        moveTo(p45x, p45y);
        lineTo(p5x, p5y);
        moveTo(p21x, p21y);
        lineTo(p1x, p1y);
        moveTo(p5x, p5y);
        lineTo(p0x, p0y);
        lineTo(p1x, p1y);
        moveTo(p31x, p31y);
        lineTo(p1x, p1y);
        moveTo(p30x, p30y);
        lineTo(p0x, p0y);
        moveTo(p35x, p35y);
        lineTo(p5x, p5y);
    }
    return false;
};
export const enlarge = (f, faceIndex, scale) => {
    f[_face_size] += scale * faceSizeGrowthScalar * f[_face_growthScale];
    if (faceIndex !== 0) {
        const dx = scale * faceSizeGrowthScalar * Math.cos(Directions.values[f[_face_direction]]) * f[_face_growthScale];
        const dy = scale * faceSizeGrowthScalar * Math.sin(Directions.values[f[_face_direction]]) * f[_face_growthScale];
        f[_face_centerX] += dx;
        f[_face_centerY] += dy;
    }
};
//# sourceMappingURL=Face.js.map