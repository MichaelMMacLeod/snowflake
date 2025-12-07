import * as Points from "../common/Point.js";
import { midpointTN, Point } from "../common/Point.js";
import { Direction } from "./Direction.js";
import * as Directions from "./Direction.js";
import { _graphic_ctx, Graphic } from "./Graphic.js";
import { outsideVisibleArea, viewspaceX, viewspaceY } from "./CoordinateSystem.js";
import { faceSizeGrowthScalar } from "../common/Constants.js";

export type Face = {
    center: Point,
    size: number,
    direction: Direction,
    growthScale: number,
    growing: boolean,
};

const SIZE_ZERO = 0.0025;

export const zero = (): Face => {
    return {
        center: Points.zero(),
        size: SIZE_ZERO,
        direction: 0,
        growthScale: 1,
        growing: true,
    }
};

export const zeroM = (face: Face): void => {
    Points.zeroM(face.center);
    face.size = SIZE_ZERO;
    face.direction = 0;
    face.growthScale = 1;
    face.growing = true;
}

export const manualPointNX = (centerX: number, size: number, absoluteDirection: number): number => {
    return centerX + size * Directions.cosines[absoluteDirection];
}

export const manualPointNY = (centerY: number, size: number, absoluteDirection: number): number => {
    return centerY + size * Directions.sines[absoluteDirection];
}

export const pointNX = (face: Face, absoluteDirection: number): number => {
    return manualPointNX(face.center.x, face.size, absoluteDirection);
}

export const pointNY = (face: Face, absoluteDirection: number): number => {
    return manualPointNY(face.center.y, face.size, absoluteDirection);
}

export const setPointN = (result: Point, face: Face, i: number) => {
    const d = (face.direction + i) % Directions.values.length;
    result.x = face.center.x + face.size * Directions.cosines[d];
    result.y = face.center.y + face.size * Directions.sines[d];
}

export const setPointNManually = (result: Point, direction: Direction, center: Point, size: number, i: number) => {
    const d = (direction + i) % Directions.values.length;
    result.x = center.x + size * Directions.cosines[d];
    result.y = center.y + size * Directions.sines[d];
}

export const draw = (g: Graphic, face: Face, faceIndex: number): boolean => {
    const d = face.direction;
    const p0x = viewspaceX(g, pointNX(face, (d + 0) % 6));
    const p0y = viewspaceY(g, pointNY(face, (d + 0) % 6));
    const p1x = viewspaceX(g, pointNX(face, (d + 1) % 6));
    const p1y = viewspaceY(g, pointNY(face, (d + 1) % 6));
    const p2x = viewspaceX(g, pointNX(face, (d + 2) % 6));
    const p2y = viewspaceY(g, pointNY(face, (d + 2) % 6));
    const p3x = viewspaceX(g, pointNX(face, (d + 3) % 6));
    const p3y = viewspaceY(g, pointNY(face, (d + 3) % 6));
    const p4x = viewspaceX(g, pointNX(face, (d + 4) % 6));
    const p4y = viewspaceY(g, pointNY(face, (d + 4) % 6));
    const p5x = viewspaceX(g, pointNX(face, (d + 5) % 6));
    const p5y = viewspaceY(g, pointNY(face, (d + 5) % 6));
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
        const cx = viewspaceX(g, face.center.x);
        const cy = viewspaceY(g, face.center.y);
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

export const enlarge = (face: Face, faceIndex: number, scale: number): void => {
    face.size += scale * faceSizeGrowthScalar * face.growthScale;
    if (faceIndex !== 0) {
        const dx = scale * faceSizeGrowthScalar * Math.cos(Directions.values[face.direction]) * face.growthScale;
        const dy = scale * faceSizeGrowthScalar * Math.sin(Directions.values[face.direction]) * face.growthScale;
        face.center.x += dx;
        face.center.y += dy;
    }
}