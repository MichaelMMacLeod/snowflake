import * as Eithers from "maybe-either/Either";
import { left, right } from "maybe-either/Either";
import { randomIntInclusive } from "./Utils.js";
const errMsg = 'integer or string containing digits [1-9]';
export const parseSnowflakeID = (value) => {
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
export const snowflakeIDString = (id) => {
    return id.map(n => n + 1).join('');
};
export const randomSnowflakeId = () => {
    const id = [randomIntInclusive(0, 3)];
    for (let i = 1; i < 16; i++) {
        id.push(randomIntInclusive(0, 8));
    }
    return Eithers.map(parseSnowflakeID(snowflakeIDString(id)), _err => { throw new Error(`randomSnowflakeId returned invalid ID: '${id}'`); }, _id => id);
};
export const randomSnowflakeIDString = () => {
    return snowflakeIDString(randomSnowflakeId());
};
//# sourceMappingURL=SnowflakeID.js.map