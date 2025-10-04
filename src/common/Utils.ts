import { yChoices } from "./Constants";
import { Either, left, right } from "./Either";
import * as Eithers from "./Either";
import { Maybe, none, some } from "./Maybe";
import * as Maybes from "./Maybe";

export function rem(x: number, m: number): number {
  return ((x % m) + m) % m;
}

export function clamp(x: number, low: number, high: number): number {
  return Math.min(Math.max(x, low), high);
}

export function lerp(a: number, b: number, n: number) {
  return (1 - n) * a + n * b;
}

export function fracPart(n: number) {
  return n % 1;
}

export type Array6<T> = [T, T, T, T, T, T];

export function makeArray6<T>(f: () => T): Array6<T> {
  return [f(), f(), f(), f(), f(), f()];
}

export function mapArray6<T, U>(array: Array6<T>, callbackfn: (value: T, index: number, array: T[]) => U, thisArg?: any): Array6<U> {
  return array.map(callbackfn, thisArg) as Array6<U>;
}

export type NonEmptyArray<T> = { 0: T } & Array<T>;

export function randomIntInclusive(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export type SideCacheArray = Float64Array;
export const sideCacheConstructor: (length: number) => SideCacheArray = length => new Float64Array(length);

export type GrowthType = 'branching' | 'faceting';
export type Growth = { scale: number, growthType: GrowthType };

export function interpretGrowth(growthInput: Array<number>, time: number): Growth {
  let s = lerp(0, growthInput.length - 1, time);
  let n = fracPart(s);
  let a = yChoices[growthInput[Math.floor(s)]];
  let b = yChoices[growthInput[Math.ceil(s)]];
  let signedScale = lerp(a, b, n);
  // let timeScalar = -0.01 * s + 1;
  return {
    scale: /*timeScalar **/ Math.abs(signedScale),
    growthType: signedScale > 0.0 ? 'branching' : 'faceting',
  };
}

export function okOrElse<T, E>(m: Maybe<T>, onNone: () => E): Either<E, T> {
  return Maybes.map(
    m,
    () => left(onNone()),
    v => right(v),
  );
}

export function ok<L, R>(e: Either<L, R>): Maybe<R> {
  return Eithers.map(
    e,
    () => none(),
    r => some(r),
  );
}

export function arraysEqual<T>(a1: Array<T>, a2: Array<T>, eqT: (t1: T, t2: T) => boolean): boolean {
  return a1.length === a2.length
    && a1.every((v, i) => eqT(v, a2[i]));
}
