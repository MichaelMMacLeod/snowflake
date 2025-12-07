export declare const rem: (x: number, m: number) => number;
export declare const clamp: (x: number, low: number, high: number) => number;
export declare const lerp: (a: number, b: number, n: number) => number;
export declare const fracPart: (n: number) => number;
export type Array6<T> = [T, T, T, T, T, T];
export declare const makeArray6: <T>(f: () => T) => Array6<T>;
export type NonEmptyArray<T> = {
    0: T;
} & Array<T>;
export type ArrayAtLeast2<T> = {
    0: T;
    1: T;
} & Array<T>;
export declare const randomIntInclusive: (min: number, max: number) => number;
export type SideCacheArray = Float64Array;
export declare const sideCacheConstructor: (length: number) => SideCacheArray;
export type GrowthTypeBranching = 0;
export declare const growthTypeBranching = 0;
export type GrowthTypeFaceting = 1;
export declare const growthTypeFaceting = 1;
export type GrowthType = GrowthTypeBranching | GrowthTypeFaceting;
export type Growth = {
    scale: number;
    growthType: GrowthType;
};
export declare const interpretGrowth: (growthInput: Array<number>, time: number) => Growth;
export declare const arraysEqual: <T>(a1: Array<T>, a2: Array<T>, eqT: (t1: T, t2: T) => boolean) => boolean;
export declare const doNothing: () => void;
