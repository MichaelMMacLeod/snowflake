import { Either } from "maybe-either/Either";
import { ArrayAtLeast2 } from "./Utils.js";
export declare const yChoices: Array<number>;
export type YChoiceIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export declare const nextLargestYChoiceIndex: (y: YChoiceIndex) => YChoiceIndex;
export declare const nextSmallestYChoiceIndex: (y: YChoiceIndex) => YChoiceIndex;
export declare const nthYChoiceIndex: (n: number) => YChoiceIndex;
declare const snowflakeIDTag: unique symbol;
export type SnowflakeID = ArrayAtLeast2<YChoiceIndex> & {
    readonly [snowflakeIDTag]: 'SnowflakeID';
};
export declare const getDefaultSnowflakeID: () => SnowflakeID;
export declare const copySnowflakeID: (value: SnowflakeID) => SnowflakeID;
export declare const parseSnowflakeIDString: (value: string) => Either<string, SnowflakeID>;
export declare const formatAsSnowflakeIDString: (id: Array<number>) => string;
export declare const randomSnowflakeID: () => SnowflakeID;
export {};
