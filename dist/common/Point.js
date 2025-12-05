import * as Directions from "../snowflake/Direction.js";
export const zero = () => {
    return { x: 0, y: 0 };
};
export const zeroM = (result) => {
    result.x = 0;
    result.y = 0;
};
export const midpointTN = (n1, n2, percent) => {
    return n1 * (1 - percent) + n2 * percent;
};
export const rotateX = (x, y, direction) => {
    return x * Directions.cosines[direction] - y * Directions.sines[direction];
};
export const rotateY = (x, y, direction) => {
    return x * Directions.sines[direction] + y * Directions.cosines[direction];
};
//# sourceMappingURL=Point.js.map