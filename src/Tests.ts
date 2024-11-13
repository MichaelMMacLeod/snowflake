// function test(cond: boolean, name: string): void {
//     if (!cond) {
//         console.error(`Test failure: ${name}`);
//     } else {
//         console.log(`Test success: ${name}`);
//     }
// }

// function testEq(a: any, b: any, name: string): void {
//     if (a === b) {
//         console.log(`Test success: ${name}`);
//     } else {
//         console.error(`Test failure: ${name}; ${a} === ${b} is false`);
//     }
// }

// function testAbs(a: number, b: number, name: string, tol: number = 0.01): void {
//     if (Math.abs(a - b) < tol) {
//         console.log(`Test success: ${name}`);
//     } else {
//         console.error(`Test failure: ${name}; |${a} - ${b}| < ${tol} is false`);
//     }
// }

// function arraysEqual<T>(xs: Array<T>, ys: Array<T>) {
//     if (xs === ys) return true;
//     if (xs.length !== ys.length) return false;
//     for (let i = 0; i < xs.length; i += 1) {
//         if (xs[i] !== ys[i]) return false;
//     }
//     return true;
// }

// function testDelete() {
//     {
//         const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'];
//         const vowels = ['a', 'e', 'i'];
//         deleteSortedElementsFromSortedArray(letters, vowels);
//         test(arraysEqual(letters, ['b', 'c', 'd', 'f', 'g', 'h']), `1: Letters was ${letters}`);
//     }
//     {
//         const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
//         const vowels = ['a', 'e'];
//         deleteSortedElementsFromSortedArray(letters, vowels);
//         test(arraysEqual(letters, ['b', 'c', 'd', 'f', 'g', 'h']), `2: Letters was ${letters}`);
//     }
// }

// function testRotatePoint() {
//     {
//         const p = { x: 10, y: 0 };
//         const r1 = rotatePoint(p, Math.PI / 2);
//         test(Math.abs(r1.x) < 0.01, `testRotatePoint1x: ${r1.x}`);
//         test(Math.abs(r1.y - 10) < 0.01, `testRotatePoint1y: ${r1.y}`);
//         const r2 = rotatePoint(p, Math.PI);
//         test(Math.abs(r2.x + 10) < 0.01, `testRotatePoint2x: ${r2.x}`);
//         test(Math.abs(r2.y) < 0.01, `testRotatePoint2y: ${r2.y}`);
//     }
// }

// function testGetFacePoints() {
//     {
//         const f = {
//             ...defaultFace,
//             center: { x: 0, y: 0 },
//             size: 10,
//         };
//         const ps = getFacePoints(f);
//         testEq(ps.length, 6, "gfp_1a");
//         testAbs(ps[0].x, 10, "gfp_1b");
//         testAbs(ps[0].y, 0, "gfp_1c");
//         testAbs(ps[1].x, 10 * Math.cos(oneSixthCircle), "gfp_1d");
//         testAbs(ps[1].y, 10 * Math.sin(oneSixthCircle), "gfp_1e");
//         testAbs(ps[2].x, 10 * Math.cos(2 * oneSixthCircle), "gfp_1f");
//         testAbs(ps[2].y, 10 * Math.sin(2 * oneSixthCircle), "gfp_1g");
//         testAbs(ps[2].y, ps[1].y, "gfp_1h");
//         testAbs(ps[1].y, -ps[5].y, "gfp_1i");
//     }

//     {
//         const f: Face = {
//             ...defaultFace,
//             center: { x: 0, y: 0 },
//             size: 10,
//             direction: 1,
//         };
//         const ps = getFacePoints(f);
//         testEq(ps.length, 6, "gfp_b1");
//         testAbs(ps[0].x, 10 * Math.cos(oneSixthCircle), "gfp_b2");
//         testAbs(ps[0].y, 10 * Math.sin(oneSixthCircle), "gfp_b3");
//     }
// }

// function testGetBranchSide2Ds() {
//     {
//         const b: Branch = {
//             ...defaultBranch,
//             start: { x: 0, y: 0 },
//             size: 1,
//             length: 10,
//             direction: 2,
//         };
//         const p = getBranchSide2Ds(b);
//         testEq(p.length, 6, "gbs_a1");
//         testAbs(p[4].right.x, Math.cos(0 * oneSixthCircle), "gbs_a2");
//         testAbs(p[4].right.y, Math.sin(0 * oneSixthCircle), "gbs_a3");
//         testAbs(p[4].left.x,
//             10 * Math.cos(2 * oneSixthCircle) + Math.cos(oneSixthCircle),
//             "gbs_a4");
//         testAbs(p[4].left.y,
//             10 * Math.sin(2 * oneSixthCircle) + Math.sin(oneSixthCircle),
//             "gbs_a5");
//         testAbs(p[3].right.x, Math.cos(5 * oneSixthCircle), "gbs_a6");
//         testAbs(p[3].right.y, Math.sin(5 * oneSixthCircle), "gbs_a7");
//         testAbs(p[3].left.x, p[4].right.x, "gbs_a8");
//         testAbs(p[3].left.y, p[4].right.y, "gbs_a9");
//     }
// }

// function testGetFaceSide2Ds() {
//     {
//         const f = {
//             ...defaultFace,
//             center: { x: 0, y: 0 },
//             size: 10,
//         };
//         const s = getFaceSide2Ds(f);
//         const p = getFacePoints(f);
//         testEq(s.length, 6, "gfp_a1");
//         testEq(p.length, 6, "gfp_a2");
//         testAbs(s[0].right.x, p[0].x, "gfp_a3");
//         testAbs(s[0].left.x, p[1].x, "gfp_a4");
//         testAbs(s[0].right.y, p[0].y, "gfp_a5");
//         testAbs(s[0].left.y, p[1].y, "gfp_a6");
//         testAbs(s[5].left.x, p[0].x, "gfp_a7");
//         testAbs(s[5].left.y, p[0].y, "gfp_a8");
//         testAbs(s[5].right.x, p[5].x, "gfp_a9");
//         testAbs(s[5].right.x, p[5].x, "gfp_a10");
//     }
// }

// function testGetNormalizedFaceSides() {
//     {
//         const f: Face = {
//             ...defaultFace,
//             size: 10,
//             direction: 0,
//             center: { x: 0, y: 0 },
//         };
//         const s = getNormalizedFaceSides(f);
//         const left = 10 * Math.cos(2 * oneSixthCircle);
//         const right = 10 * Math.cos(oneSixthCircle);
//         const height = 10 * Math.sin(oneSixthCircle);
//         for (let t = 0; t < 6; t += 1) {
//             testAbs(s[t].left, left, `norm_a${t}_left`);
//             testAbs(s[t].right, right, `norm_a${t}_right`);
//             testAbs(s[t].height, height, `norm_a${t}_height`);
//         }
//     }
//     {
//         const s: Array<[Array<Side2D>, Array<Side>]> = directions.map((d, i) => {
//             if (isDirection(i)) {
//                 const f: Face = {
//                     ...defaultFace,
//                     size: 10,
//                     direction: i,
//                     center: rotatePoint({ x: 50, y: 0 }, d),
//                 };
//                 return [getFaceSide2Ds(f), getNormalizedFaceSides(f)];
//             } else {
//                 console.error('problem in norm');
//                 return [getFaceSide2Ds(defaultFace), getNormalizedFaceSides(defaultFace)];
//             }
//         });
//         testAbs(s[0][1][0].left, s[1][0][0].left.x, "norm_b1");
//         testAbs(s[0][1][0].right, s[1][0][0].right.x, "norm_b2");
//         testAbs(s[5][1][5].left, s[1][0][5].left.x, "norm_b3");
//         testAbs(s[5][1][5].right, s[1][0][5].right.x, "norm_b4");
//         testAbs(s[0][1][1].left, s[0][0][1].left.x, "norm_b5");
//         testAbs(s[0][1][1].right, s[0][0][1].right.x, "norm_b6");
//     }
// }

// function testOverlaps() {
//     function s(left: number, right: number, height: number): Side {
//         return { left, right, height };
//     }
//     {
//         test(overlaps(s(0, 2, 1), s(1, 3, 0)) !== undefined, "ol1");
//         test(overlaps(s(1, 3, 1), s(0, 2, 0)) !== undefined, "ol2");
//         test(overlaps(s(0, 3, 1), s(1, 2, 0)) !== undefined, "ol3");
//         test(overlaps(s(1, 2, 1), s(0, 3, 0)) !== undefined, "ol4");

//         test(!overlaps(s(0, 2, 0), s(1, 3, 1)) !== undefined, "ol5");
//         test(!overlaps(s(1, 3, 0), s(0, 2, 1)) !== undefined, "ol6");
//         test(!overlaps(s(0, 3, 0), s(1, 2, 1)) !== undefined, "ol7");
//         test(!overlaps(s(1, 2, 0), s(0, 3, 1)) !== undefined, "ol8");

//         test(!overlaps(s(0, 1, 1), s(2, 3, 0)) !== undefined, "ol9");
//         test(!overlaps(s(2, 3, 1), s(0, 1, 0)) !== undefined, "ol10");

//         test(!overlaps(s(0, 1, 0), s(2, 3, 1)) !== undefined, "ol11");
//         test(!overlaps(s(2, 3, 0), s(0, 1, 1)) !== undefined, "ol12");

//     }
// }

// function testGetBranchPoints() {
//     {
//         const b: Branch = {
//             ...defaultBranch,
//             start: { x: 0, y: 0 },
//             direction: 0,
//             length: 10,
//             size: 1,
//         };
//         const p = getBranchPoints(b);
//         testEq(p.length, 6, "gbp_a1");
//         testAbs(p[0].x, 11, "gbp_a2");
//         testAbs(p[0].y, 0, "gbp_a3");
//         testAbs(p[5].x, 10 + Math.cos(5 * oneSixthCircle), "gbp_a4");
//         testAbs(p[5].y, Math.sin(5 * oneSixthCircle), "gbp_a5");
//     }
// }

// const enableTests = true;
// if (enableTests) {
//     testDelete();
//     testRotatePoint();
//     testGetFacePoints();
//     testGetFaceSide2Ds();
//     testGetNormalizedFaceSides();
//     testGetBranchPoints();
//     testGetBranchSide2Ds();
//     testOverlaps();
// }