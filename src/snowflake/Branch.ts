import { midpointTN } from "../common/Point.js";
import { Direction } from "./Direction.js";
import * as Directions from "./Direction.js";
import { _graphic_ctx, Graphic } from "./Graphic.js";
import { outsideVisibleArea, viewspaceX, viewspaceY } from "./CoordinateSystem.js";
import * as Faces from "./Face.js";
import { branchLengthGrowthScalar, branchSizeGrowthScalar } from "../common/Constants.js";
import { rem } from "../common/Utils.js";

export const _branch_startX = 0;
export const _branch_startY = 1;
export const _branch_size = 2;
export const _branch_length = 3;
export const _branch_direction = 4;
export const _branch_growthScale = 5;
export const _branch_growing = 6;
export type Branch = {
    [_branch_startX]: number,
    [_branch_startY]: number,
    [_branch_size]: number,
    [_branch_length]: number,
    [_branch_direction]: Direction,
    [_branch_growthScale]: number,
    [_branch_growing]: boolean,
}

export const zero = (): Branch => {
    const startX = 0;
    const startY = 0;
    const size = 0;
    const length = 0;
    const direction = 0;
    const growthScale = 0;
    const growing = false;
    return [
        startX,
        startY,
        size,
        length,
        direction,
        growthScale,
        growing
    ];
}

export const endCenterX = (branch: Branch): number => {
    return branch[_branch_startX] + branch[_branch_length] * Directions.cosines[branch[_branch_direction]];
}

export const endCenterY = (branch: Branch): number => {
    return branch[_branch_startY] + branch[_branch_length] * Directions.sines[branch[_branch_direction]];
}

export const pointNX = (branch: Branch, absoluteDirection: number): number => {
    const d = rem(absoluteDirection - branch[_branch_direction], Directions.NUM_DIRECTIONS);
    if (d === 5 || d === 0 || d === 1) {
        return Faces.manualPointNX(endCenterX(branch), branch[_branch_size], absoluteDirection);
    }
    return Faces.manualPointNX(branch[_branch_startX], branch[_branch_size], absoluteDirection);
}

export const pointNY = (branch: Branch, absoluteDirection: number): number => {
    const d = rem(absoluteDirection - branch[_branch_direction], Directions.NUM_DIRECTIONS);
    if (d === 5 || d === 0 || d === 1) {
        return Faces.manualPointNY(endCenterY(branch), branch[_branch_size], absoluteDirection);
    }
    return Faces.manualPointNY(branch[_branch_startY], branch[_branch_size], absoluteDirection);
}

export const draw = (g: Graphic, branch: Branch, drawBranchSides: boolean): boolean => {
    const d = branch[_branch_direction];
    const p0x = viewspaceX(g, pointNX(branch, (d + 0) % 6));
    const p0y = viewspaceY(g, pointNY(branch, (d + 0) % 6));
    const p1x = viewspaceX(g, pointNX(branch, (d + 1) % 6));
    const p1y = viewspaceY(g, pointNY(branch, (d + 1) % 6));
    const p2x = viewspaceX(g, pointNX(branch, (d + 2) % 6));
    const p2y = viewspaceY(g, pointNY(branch, (d + 2) % 6));
    const p3x = viewspaceX(g, pointNX(branch, (d + 3) % 6));
    const p3y = viewspaceY(g, pointNY(branch, (d + 3) % 6));
    const p4x = viewspaceX(g, pointNX(branch, (d + 4) % 6));
    const p4y = viewspaceY(g, pointNY(branch, (d + 4) % 6));
    const p5x = viewspaceX(g, pointNX(branch, (d + 5) % 6));
    const p5y = viewspaceY(g, pointNY(branch, (d + 5) % 6));
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
    const moveTo = ctx.moveTo.bind(ctx);
    const lineTo = ctx.lineTo.bind(ctx);
    moveTo(p5x, p5y);
    lineTo(p0x, p0y);
    lineTo(p1x, p1y);
    if (drawBranchSides) {
        moveTo(p45x, p45y);
        lineTo(p5x, p5y);
        moveTo(p21x, p21y);
        lineTo(p1x, p1y);
    }
    moveTo(p0x, p0y);
    lineTo(p3x, p3y);

    return false;
}

export const enlarge = (branch: Branch, scale: number): void => {
    branch[_branch_size] += branchSizeGrowthScalar * branch[_branch_growthScale];
    branch[_branch_length] += branchLengthGrowthScalar * branch[_branch_growthScale];
}
