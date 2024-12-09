import * as Points from "../src/Point";
import { Point } from "../src/Point";

function sum(a: number, b: number): number {
    const p1: Point = { x: a, y: 0 };
    const p2: Point = { x: b, y: 0 };
    return Points.add(p1, p2).x;
}

test('test 1', () => {
    expect(sum(1, 2)).toBe(3);
});