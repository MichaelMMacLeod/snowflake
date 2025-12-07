import { yChoices } from "./SnowflakeID.js";

export const rem = (x: number, m: number): number => {
  return ((x % m) + m) % m;
}

export const clamp = (x: number, low: number, high: number): number => {
  return Math.min(Math.max(x, low), high);
}

export const lerp = (a: number, b: number, n: number) => {
  return (1 - n) * a + n * b;
}

export const fracPart = (n: number) => {
  return n % 1;
}

export type Array6<T> = [T, T, T, T, T, T];

export const makeArray6 = <T>(f: () => T): Array6<T> => {
  return [f(), f(), f(), f(), f(), f()];
}

export type NonEmptyArray<T> = { 0: T } & Array<T>;
export type ArrayAtLeast2<T> = { 0: T, 1: T } & Array<T>;

export const randomIntInclusive = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export type SideCacheArray = Float64Array;
export const sideCacheConstructor: (length: number) => SideCacheArray = length => new Float64Array(length);

export type GrowthTypeBranching = 0;
export const growthTypeBranching = 0;
export type GrowthTypeFaceting = 1;
export const growthTypeFaceting = 1;
export type GrowthType = GrowthTypeBranching | GrowthTypeFaceting;
export type Growth = { scale: number, growthType: GrowthType };

export const interpretGrowth = (growthInput: Array<number>, time: number): Growth => {
  let s = lerp(0, growthInput.length - 1, time);
  let n = fracPart(s);
  let a = yChoices[growthInput[Math.floor(s)]];
  let b = yChoices[growthInput[Math.ceil(s)]];
  let signedScale = lerp(a, b, n);
  return {
    scale: Math.abs(signedScale),
    growthType: signedScale > 0.0 ? growthTypeBranching : growthTypeFaceting,
  };
}

export const arraysEqual = <T>(a1: Array<T>, a2: Array<T>, eqT: (t1: T, t2: T) => boolean): boolean => {
  return a1.length === a2.length
    && a1.every((v, i) => eqT(v, a2[i]));
}

export const doNothing = () => { return; };