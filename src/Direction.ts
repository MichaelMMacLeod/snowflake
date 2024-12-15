import { rem, Array6 } from "./Utils";
import { oneSixthCircle } from "./Constants";

export type Direction = 0 | 1 | 2 | 3 | 4 | 5;
export const DIRS: 6 = 6;

export const values: Array6<number> = [
    0 * oneSixthCircle,
    1 * oneSixthCircle,
    2 * oneSixthCircle,
    3 * oneSixthCircle,
    4 * oneSixthCircle,
    5 * oneSixthCircle,
];

export const cosines: Array6<number> = [
    Math.cos(values[0]),
    Math.cos(values[1]),
    Math.cos(values[2]),
    Math.cos(values[3]),
    Math.cos(values[4]),
    Math.cos(values[5]),
];

export const sines: Array6<number> = [
    Math.sin(values[0]),
    Math.sin(values[1]),
    Math.sin(values[2]),
    Math.sin(values[3]),
    Math.sin(values[4]),
    Math.sin(values[5]),
];

export function next(d: Direction): Direction {
    return ((d + 1) % values.length) as Direction;
}

export function previous(d: Direction): Direction {
    return rem(d - 1, values.length) as Direction;
}
