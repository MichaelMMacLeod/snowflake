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
const cos = Math.cos;
export const cosines = [
    cos(values[0]),
    cos(values[1]),
    cos(values[2]),
    cos(values[3]),
    cos(values[4]),
    cos(values[5]),
];
const sin = Math.sin;
export const sines = [
    sin(values[0]),
    sin(values[1]),
    sin(values[2]),
    sin(values[3]),
    sin(values[4]),
    sin(values[5]),
];
//# sourceMappingURL=Direction.js.map