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
export type Maybe<T> =
  { variant: 0 }
  | { variant: 1, value: T }

export function none<T>(): Maybe<T> {
  return { variant: 0 };
}

export function some<T>(value: T): Maybe<T> {
  return { variant: 1, value }
}