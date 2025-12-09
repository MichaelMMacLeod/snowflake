import * as Eithers from "maybe-either/Either";
import { Either, left, right } from "maybe-either/Either";
import { ArrayAtLeast2, NonEmptyArray, randomIntInclusive } from "./Utils.js";

// export const yChoices: Array<number> = [-1, -0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75, 1];
export const yChoices: Array<number> = [
    -1.0 + 0/9,
    -1.0 + 2/9,
    -1.0 + 4/9,
    -1.0 + 6/9,
    -1.0 + 8/9,
    -1.0 + 10/9,
    -1.0 + 12/9,
    -1.0 + 14/9,
    -1.0 + 16/9,
    -1.0 + 18/9,
];

export type YChoiceIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export const nextLargestYChoiceIndex = (y: YChoiceIndex): YChoiceIndex => {
    return Math.min(9, y + 1) as YChoiceIndex;
};

export const nextSmallestYChoiceIndex = (y: YChoiceIndex): YChoiceIndex => {
    return Math.max(0, y - 1) as YChoiceIndex;
};

export const nthYChoiceIndex = (n: number): YChoiceIndex => {
    return Math.min(9, Math.max(0, Math.floor(n))) as YChoiceIndex;
}

declare const snowflakeIDTag: unique symbol;
// SnowflakeIDs must have at least two yChoiceIndices because the line drawn on the graph
// must have at least two points on it. Also, when growing the snowflake, we need to interpolate
// between at least two points to figure out how to grow at any given time t.
export type SnowflakeID = ArrayAtLeast2<YChoiceIndex> & { readonly [snowflakeIDTag]: 'SnowflakeID' };

export const getDefaultSnowflakeID = () => [...[0, 2, 8, 1, 4, 1, 4, 6, 1, 8, 0]] as unknown as SnowflakeID;

export const copySnowflakeID = (value: SnowflakeID): SnowflakeID => {
    return value.slice() as SnowflakeID;
}

const errMsg = 'string containing digits [0-9]';

export const parseSnowflakeIDString = (value: string): Either<string, SnowflakeID> => {
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
        const parsedDigit = digit;
        result.push(parsedDigit);
    }
    if (result.length < 2) {
        return left('string containing at least two digits');
    }
    return right(result as SnowflakeID);
}

export const formatAsSnowflakeIDString = (id: Array<number>): string => {
    return id.map(n => n).join('');
}

export const randomSnowflakeID = (): SnowflakeID => {
    const id = [randomIntInclusive(0, 4)];
    for (let i = 1; i < 16; i++) {
        id.push(randomIntInclusive(0, 9));
    }
    return Eithers.map(
        parseSnowflakeIDString(formatAsSnowflakeIDString(id)),
        err => {
            console.error(`randomSnowflakeId generated invalid ID: '${id}'; ${err}`);
            return getDefaultSnowflakeID();
        },
        id => id
    );
}

export const randomSnowflakeIDString = (): string => {
    return formatAsSnowflakeIDString(randomSnowflakeID());
}

if (Eithers.isLeft(parseSnowflakeIDString(formatAsSnowflakeIDString(getDefaultSnowflakeID())))) {
    console.error('default snowflake ID is not valid');
}