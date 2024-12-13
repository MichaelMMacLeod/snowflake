import { Either, left, right } from "./Either";

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

/** @see {isRGBA} ts-auto-guard:type-guard */
export type RGBA = {
  r: number,
  g: number,
  b: number,
  a: number,
};

export function convertRGBAToString(rgba: RGBA): string {
  const { r, g, b, a } = rgba;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export function randomIntInclusive(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function parseSnowflakeId(value: any): Either<string, Array<number>> {
    if (value.toString === undefined) {
        return left(`non-integer, '${value}'`);
    }
    const digits = value.toString();
    const result = [];
    for (let i = 0; i < digits.length; ++i) {
        const digit = parseInt(digits[i], 10);
        if (Number.isNaN(digit)) {
            return left(`string containing a digit other than 1 through 9, '${value}'`)
        }
        if (digit === 0) {
            return left(`string containing the digit zero, '${value}'`);
        }
        const parsedDigit = digit - 1;
        result.push(parsedDigit);
    }
    if (result.length === 0) {
        return left(`empty snowflake ID, '${value}'`);
    }
    return right(result);
}