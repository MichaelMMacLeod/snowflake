import * as Points from "../common/Point";
import { midpointTN, Point } from "../common/Point";
import { Direction } from "./Direction";
import * as Directions from "./Direction";
import { Graphic } from "./Graphic";
import { outsideVisibleArea, viewspaceX, viewspaceY } from "./CoordinateSystem";
import { faceSizeGrowthScalar } from "../common/Constants";
import { Array6, makeArray6, rem } from "../common/Utils";

export type Face = {
    center: Point,
    size: number,
    isFirstFace: boolean,
    direction: Direction,
    growthScale: number,
    growing: boolean,
};

const SIZE_ZERO = 0.0025;

export function zero(): Face {
    return {
        center: Points.zero(),
        size: SIZE_ZERO,
        isFirstFace: true,
        direction: 0,
        growthScale: 1,
        growing: true,
    }
};

export function zeroM(face: Face): void {
    Points.zeroM(face.center);
    face.size = SIZE_ZERO;
    face.isFirstFace = true;
    face.direction = 0;
    face.growthScale = 1;
    face.growing = true;
}

export function manualPointNX(centerX: number, size: number, absoluteDirection: number): number {
    return centerX + size * Directions.cosines[absoluteDirection];
}

export function manualPointNY(centerY: number, size: number, absoluteDirection: number): number {
    return centerY + size * Directions.sines[absoluteDirection];
}

export function pointNX(face: Face, absoluteDirection: number): number {
    return manualPointNX(face.center.x, face.size, absoluteDirection);
}

export function pointNY(face: Face, absoluteDirection: number): number {
    return manualPointNY(face.center.y, face.size, absoluteDirection);
}

export function setPointN(result: Point, face: Face, i: number) {
    const d = (face.direction + i) % Directions.values.length;
    result.x = face.center.x + face.size * Directions.cosines[d];
    result.y = face.center.y + face.size * Directions.sines[d];
}

export function setPointNManually(result: Point, direction: Direction, center: Point, size: number, i: number) {
    const d = (direction + i) % Directions.values.length;
    result.x = center.x + size * Directions.cosines[d];
    result.y = center.y + size * Directions.sines[d];
}

export function draw(graphic: Graphic, face: Face): boolean {
    const d = face.direction;
    const p0x = viewspaceX(graphic, pointNX(face, (d + 0) % 6));
    const p0y = viewspaceY(graphic, pointNY(face, (d + 0) % 6));
    const p1x = viewspaceX(graphic, pointNX(face, (d + 1) % 6));
    const p1y = viewspaceY(graphic, pointNY(face, (d + 1) % 6));
    const p2x = viewspaceX(graphic, pointNX(face, (d + 2) % 6));
    const p2y = viewspaceY(graphic, pointNY(face, (d + 2) % 6));
    const p3x = viewspaceX(graphic, pointNX(face, (d + 3) % 6));
    const p3y = viewspaceY(graphic, pointNY(face, (d + 3) % 6));
    const p4x = viewspaceX(graphic, pointNX(face, (d + 4) % 6));
    const p4y = viewspaceY(graphic, pointNY(face, (d + 4) % 6));
    const p5x = viewspaceX(graphic, pointNX(face, (d + 5) % 6));
    const p5y = viewspaceY(graphic, pointNY(face, (d + 5) % 6));
    if (outsideVisibleArea(graphic, p0x)
        || outsideVisibleArea(graphic, p1x)
        || outsideVisibleArea(graphic, p2x)
        || outsideVisibleArea(graphic, p3x)
        || outsideVisibleArea(graphic, p4x)
        || outsideVisibleArea(graphic, p5x)
        || outsideVisibleArea(graphic, p0y)
        || outsideVisibleArea(graphic, p1y)
        || outsideVisibleArea(graphic, p2y)
        || outsideVisibleArea(graphic, p3y)
        || outsideVisibleArea(graphic, p4y)
        || outsideVisibleArea(graphic, p5y)
    ) {
        return true;
    }
    const ctx = graphic.ctx;
    if (face.isFirstFace) {
        const cx = viewspaceX(graphic, face.center.x);
        const cy = viewspaceY(graphic, face.center.y);
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

export function enlarge(face: Face, scale: number): void {
    face.size += scale * faceSizeGrowthScalar * face.growthScale;
    if (!face.isFirstFace) {
        const dx = scale * faceSizeGrowthScalar * Math.cos(Directions.values[face.direction]) * face.growthScale;
        const dy = scale * faceSizeGrowthScalar * Math.sin(Directions.values[face.direction]) * face.growthScale;
        face.center.x += dx;
        face.center.y += dy;
    }
}