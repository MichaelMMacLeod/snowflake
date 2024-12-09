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

export type NonEmptyArray<T> = { 0: T } & Array<T>;

function deleteSortedElementsFromSortedArray<T>(removeArray: Array<T>, elements: Array<T>) {
  let completed = 0;
  let removePos = 0;
  let elementPos = 0;
  while (removePos < removeArray.length) {
    if (removeArray[removePos] === elements[elementPos]) {
      elementPos += 1;
    } else {
      removeArray[completed] = removeArray[removePos];
      completed += 1;
    }
    removePos += 1;
  }
  removeArray.splice(completed);
}