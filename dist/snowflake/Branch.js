import * as Points from "../common/Point.js";
import { midpointTN } from "../common/Point.js";
import * as Directions from "./Direction.js";
import { _graphic_ctx } from "./Graphic.js";
import { outsideVisibleArea, viewspaceX, viewspaceY } from "./CoordinateSystem.js";
import * as Faces from "./Face.js";
import { branchLengthGrowthScalar, branchSizeGrowthScalar } from "../common/Constants.js";
import { rem } from "../common/Utils.js";
export const zero = () => {
    return {
        start: Points.zero(),
        size: 0,
        length: 0,
        direction: 0,
        growthScale: 0,
        growing: false,
    };
};
export const endCenterX = (branch) => {
    return branch.start.x + branch.length * Directions.cosines[branch.direction];
};
export const endCenterY = (branch) => {
    return branch.start.y + branch.length * Directions.sines[branch.direction];
};
export const pointNX = (branch, absoluteDirection) => {
    const d = rem(absoluteDirection - branch.direction, Directions.values.length);
    if (d === 5 || d === 0 || d === 1) {
        return Faces.manualPointNX(endCenterX(branch), branch.size, absoluteDirection);
    }
    return Faces.manualPointNX(branch.start.x, branch.size, absoluteDirection);
};
export const pointNY = (branch, absoluteDirection) => {
    const d = rem(absoluteDirection - branch.direction, Directions.values.length);
    if (d === 5 || d === 0 || d === 1) {
        return Faces.manualPointNY(endCenterY(branch), branch.size, absoluteDirection);
    }
    return Faces.manualPointNY(branch.start.y, branch.size, absoluteDirection);
};
export const draw = (g, branch) => {
    const d = branch.direction;
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
        || outsideVisibleArea(g, p5y)) {
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
};
export const enlarge = (branch, scale) => {
    branch.size += branchSizeGrowthScalar * branch.growthScale;
    branch.length += branchLengthGrowthScalar * branch.growthScale;
};
//# sourceMappingURL=Branch.js.map