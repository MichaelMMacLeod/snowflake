import { rem, Array6 } from "./Utils";
import { oneSixthCircle } from "./Constants";

export type Direction = 0 | 1 | 2 | 3 | 4 | 5;

function is(i: number): i is Direction {
  return i === 0 || i === 1 || i === 2 ||
    i === 3 || i === 4 || i === 5;
}

export const values: Array6<number> = [
    0 * oneSixthCircle,
    1 * oneSixthCircle,
    2 * oneSixthCircle,
    3 * oneSixthCircle,
    4 * oneSixthCircle,
    5 * oneSixthCircle,
];

export function next(d: Direction): Direction {
    return ((d + 1) % values.length) as Direction;
}

export function previous(d: Direction): Direction {
    return rem(d - 1, values.length) as Direction;
}
