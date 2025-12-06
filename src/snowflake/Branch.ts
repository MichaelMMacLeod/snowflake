import * as Points from "../common/Point.js";
import { midpointTN, Point } from "../common/Point.js";
import { Direction } from "./Direction.js";
import * as Directions from "./Direction.js";
import { _graphic_ctx, Graphic } from "./Graphic.js";
import { outsideVisibleArea, viewspaceX, viewspaceY } from "./CoordinateSystem.js";
import * as Faces from "./Face.js";
import { branchLengthGrowthScalar, branchSizeGrowthScalar } from "../common/Constants.js";
import { rem } from "../common/Utils.js";

export const endCenterX = (startX: number, length: number, d: Direction): number => {
    return startX + length * Directions.cosines[d];
}

export const endCenterY = (startY: number, length: number, d: Direction): number => {
    return startY + length * Directions.sines[d];
}

export const pointNX = (startX: number, length: number, branchDirection: Direction, size: number, absoluteDirection: number): number => {
    const d = rem(absoluteDirection - branchDirection, Directions.values.length);
    if (d === 5 || d === 0 || d === 1) {
        return Faces.pointNX(endCenterX(startX, length, d), size, absoluteDirection);
    }
    return Faces.pointNX(startX, size, absoluteDirection);
}

export const pointNY = (startY: number, length: number, branchDirection: Direction, size: number, absoluteDirection: number): number => {
    const d = rem(absoluteDirection - branchDirection, Directions.values.length);
    if (d === 5 || d === 0 || d === 1) {
        return Faces.pointNY(endCenterY(startY, length, branchDirection), size, absoluteDirection);
    }
    return Faces.pointNY(startY, size, absoluteDirection);
}

export const draw = (g: Graphic, startX: number, startY: number, d: Direction, size: number): boolean => {
    const p0x = viewspaceX(g, pointNX(startX, length, d, size, (d + 0) % 6));
    const p0y = viewspaceY(g, pointNY(startY, length, d, size, (d + 0) % 6));
    const p1x = viewspaceX(g, pointNX(startX, length, d, size, (d + 1) % 6));
    const p1y = viewspaceY(g, pointNY(startY, length, d, size, (d + 1) % 6));
    const p2x = viewspaceX(g, pointNX(startX, length, d, size, (d + 2) % 6));
    const p2y = viewspaceY(g, pointNY(startY, length, d, size, (d + 2) % 6));
    const p3x = viewspaceX(g, pointNX(startX, length, d, size, (d + 3) % 6));
    const p3y = viewspaceY(g, pointNY(startY, length, d, size, (d + 3) % 6));
    const p4x = viewspaceX(g, pointNX(startX, length, d, size, (d + 4) % 6));
    const p4y = viewspaceY(g, pointNY(startY, length, d, size, (d + 4) % 6));
    const p5x = viewspaceX(g, pointNX(startX, length, d, size, (d + 5) % 6));
    const p5y = viewspaceY(g, pointNY(startY, length, d, size, (d + 5) % 6));
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
    const p45x = midpointTN(p4x, p5x, 0);
    const p45y = midpointTN(p4y, p5y, 0);
    const p21x = midpointTN(p2x, p1x, 0);
    const p21y = midpointTN(p2y, p1y, 0);

    const ctx = g[_graphic_ctx];
    ctx.moveTo(p5x, p5y);
    ctx.lineTo(p0x, p0y);
    ctx.lineTo(p1x, p1y);
    ctx.moveTo(p45x, p45y);
    ctx.lineTo(p5x, p5y);
    ctx.moveTo(p21x, p21y);
    ctx.lineTo(p1x, p1y);
    ctx.moveTo(p0x, p0y);
    ctx.lineTo(p3x, p3y);

    return false;
}