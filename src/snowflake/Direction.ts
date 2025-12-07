import { rem, Array6 } from "../common/Utils.js";
import { oneSixthCircle } from "../common/Constants.js";

export type Direction = 0 | 1 | 2 | 3 | 4 | 5;
export const NUM_DIRECTIONS: 6 = 6;

export const values: Array6<number> = [
    0 * oneSixthCircle,
    1 * oneSixthCircle,
    2 * oneSixthCircle,
    3 * oneSixthCircle,
    4 * oneSixthCircle,
    5 * oneSixthCircle,
];

const cos = Math.cos;
export const cosines: Array6<number> = [
    cos(values[0]),
    cos(values[1]),
    cos(values[2]),
    cos(values[3]),
    cos(values[4]),
    cos(values[5]),
];

const sin = Math.sin;
export const sines: Array6<number> = [
    sin(values[0]),
    sin(values[1]),
    sin(values[2]),
    sin(values[3]),
    sin(values[4]),
    sin(values[5]),
];
