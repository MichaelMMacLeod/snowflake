import * as Points from "../src/Point";
import { Point } from "../src/Point";

function sum(a: number, b: number): number {
    const p1: Point = { x: a, y: 0 };
    const p2: Point = { x: b, y: 0 };
    return Points.add(p1, p2).x;
}

// test('normalize offset', () => {
//     const f = Faces.zero();
//     f.size = 1;
//     f.center = { x: 1, y: 1 };
//     const sides = Side2Ds.ofFace(f).map((s, i) => Sides.normalizeSide2D(s, i));
//     console.error(sides);
//     // sides.forEach(s => {
//     //     expect(s.left).toBeCloseTo(-0.5);
//     //     expect(s.right).toBeCloseTo(0.5);
//     //     expect(s.height).toBeCloseTo(0.866);
//     // });
// });