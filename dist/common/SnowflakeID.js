import * as Eithers from "maybe-either/Either";
import { left, right } from "maybe-either/Either";
import { randomIntInclusive } from "./Utils.js";
export const yChoices = [-1, -0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75, 1];
export const nextLargestYChoiceIndex = (y) => {
    return Math.min(8, y + 1);
};
export const nextSmallestYChoiceIndex = (y) => {
    return Math.max(0, y - 1);
};
export const nthYChoiceIndex = (n) => {
    return Math.min(8, Math.max(0, Math.floor(n)));
};
export const defaultSnowflakeID = [0, 2, 8, 1, 4, 1, 4, 6, 1, 8, 0];
export const copySnowflakeID = (value) => {
    return value.slice();
};
const errMsg = 'string containing digits [1-9]';
export const parseSnowflakeIDString = (value) => {
    if (value.toString === undefined) {
        return left(errMsg);
    }
    const digits = value.toString();
    const result = [];
    for (let i = 0; i < digits.length; ++i) {
        const digit = parseInt(digits[i], 10);
        if (Number.isNaN(digit)) {
            return left(errMsg);
        }
        if (digit === 0) {
            return left(errMsg);
        }
        const parsedDigit = digit - 1;
        result.push(parsedDigit);
    }
    if (result.length < 2) {
        return left('integer or string containing at least two nonzero digits');
    }
    return right(result);
};
export const formatAsSnowflakeIDString = (id) => {
    return id.map(n => n + 1).join('');
};
export const randomSnowflakeID = () => {
    const id = [randomIntInclusive(0, 3)];
    for (let i = 1; i < 16; i++) {
        id.push(randomIntInclusive(0, 8));
    }
    return Eithers.map(parseSnowflakeIDString(formatAsSnowflakeIDString(id)), err => {
        console.error(`randomSnowflakeId generated invalid ID: '${id}'; ${err}`);
        return defaultSnowflakeID;
    }, id => id);
};
export const randomSnowflakeIDString = () => {
    return formatAsSnowflakeIDString(randomSnowflakeID());
};
if (Eithers.isLeft(parseSnowflakeIDString(formatAsSnowflakeIDString(defaultSnowflakeID)))) {
    console.error('default snowflake ID is not valid');
}
//# sourceMappingURL=SnowflakeID.js.map