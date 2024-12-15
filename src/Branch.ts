import * as Points from "./Point";
import { midpointTN, Point } from "./Point";
import { Direction } from "./Direction";
import * as Directions from "./Direction";
import { Graphic } from "./Graphic";
import { outsideVisibleArea, viewspaceX, viewspaceY, worldToViewTransform } from "./CoordinateSystem";
import * as Faces from "./Face";
import { branchLengthGrowthScalar, branchSizeGrowthScalar } from "./Constants";
import { rem } from "./Utils";

export type Branch = {
    start: Point,
    size: number,
    length: number,
    direction: Direction,
    growthScale: number,
    growing: boolean,
}

export function zero(): Branch {
    return {
        start: Points.zero(),
        size: 0,
        length: 0,
        direction: 0,
        growthScale: 0,
        growing: false,
    };
}

export function endCenterX(branch: Branch): number {
    return branch.start.x + branch.length * Directions.cosines[branch.direction];
}

export function endCenterY(branch: Branch): number {
    return branch.start.y + branch.length * Directions.sines[branch.direction];
}

export function pointNX(branch: Branch, absoluteDirection: number): number {
    const d = rem(absoluteDirection - branch.direction, Directions.values.length);
    if (d === 5 || d === 0 || d === 1) {
        return Faces.manualPointNX(endCenterX(branch), branch.size, absoluteDirection);
    }
    return Faces.manualPointNX(branch.start.x, branch.size, absoluteDirection);
}

export function pointNY(branch: Branch, absoluteDirection: number): number {
    const d = rem(absoluteDirection - branch.direction, Directions.values.length);
    if (d === 5 || d === 0 || d === 1) {
        return Faces.manualPointNY(endCenterY(branch), branch.size, absoluteDirection);
    }
    return Faces.manualPointNY(branch.start.y, branch.size, absoluteDirection);
}

export function draw(graphic: Graphic, branch: Branch): boolean {
    const d = branch.direction;
    const p0x = viewspaceX(graphic, pointNX(branch, (d + 0) % 6));
    const p0y = viewspaceY(graphic, pointNY(branch, (d + 0) % 6));
    const p1x = viewspaceX(graphic, pointNX(branch, (d + 1) % 6));
    const p1y = viewspaceY(graphic, pointNY(branch, (d + 1) % 6));
    const p2x = viewspaceX(graphic, pointNX(branch, (d + 2) % 6));
    const p2y = viewspaceY(graphic, pointNY(branch, (d + 2) % 6));
    const p3x = viewspaceX(graphic, pointNX(branch, (d + 3) % 6));
    const p3y = viewspaceY(graphic, pointNY(branch, (d + 3) % 6));
    const p4x = viewspaceX(graphic, pointNX(branch, (d + 4) % 6));
    const p4y = viewspaceY(graphic, pointNY(branch, (d + 4) % 6));
    const p5x = viewspaceX(graphic, pointNX(branch, (d + 5) % 6));
    const p5y = viewspaceY(graphic, pointNY(branch, (d + 5) % 6));
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
    const p45x = midpointTN(p4x, p5x, 0);
    const p45y = midpointTN(p4y, p5y, 0);
    const p21x = midpointTN(p2x, p1x, 0);
    const p21y = midpointTN(p2y, p1y, 0);

    const ctx = graphic.ctx;
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

export function enlarge(branch: Branch, scale: number): void {
    // const lengthScalar = -1.5 * scale + 1.5;
    // const sizeScalar = 1.5 * scale;
    branch.size += branchSizeGrowthScalar * branch.growthScale;
    branch.length += branchLengthGrowthScalar * branch.growthScale;
}
