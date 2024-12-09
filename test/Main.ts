import * as Points from "../src/Point";
import * as Sides from "../src/Side";
import { Point } from "../src/Point";
import { Side2D } from "../src/Side2D";
import * as Side2Ds from "../src/Side2D";
import * as Faces from "../src/Face";

function sum(a: number, b: number): number {
    const p1: Point = { x: a, y: 0 };
    const p2: Point = { x: b, y: 0 };
    return Points.add(p1, p2).x;
}

test('normalize centered', () => {
    const f = Faces.zero();
    f.size = 1;
    const sides = Side2Ds.ofFace(f).map((s, i) => Sides.normalizeSide2D(s, i));
    sides.forEach(s => {
        expect(s.left).toBeCloseTo(-0.5);
        expect(s.right).toBeCloseTo(0.5);
        expect(s.height).toBeCloseTo(0.866);
    });
});

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