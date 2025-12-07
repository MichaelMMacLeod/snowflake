import { oneSixthCircle } from "../common/Constants.js";
export const NUM_DIRECTIONS = 6;
export const values = [
    0 * oneSixthCircle,
    1 * oneSixthCircle,
    2 * oneSixthCircle,
    3 * oneSixthCircle,
    4 * oneSixthCircle,
    5 * oneSixthCircle,
];
export const cosines = [
    Math.cos(values[0]),
    Math.cos(values[1]),
    Math.cos(values[2]),
    Math.cos(values[3]),
    Math.cos(values[4]),
    Math.cos(values[5]),
];
export const sines = [
    Math.sin(values[0]),
    Math.sin(values[1]),
    Math.sin(values[2]),
    Math.sin(values[3]),
    Math.sin(values[4]),
    Math.sin(values[5]),
];
//# sourceMappingURL=Direction.js.map