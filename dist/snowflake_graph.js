var snowflake_graph;
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": () => (/* binding */ src_SnowflakeGraphElement)
});

;// ./src/Either.ts
function Either_left(value) {
    return { v: 0, d: value };
}
function Either_right(value) {
    return { v: 1, d: value };
}
function map(e, onLeft, onRight) {
    switch (e.v) {
        case 0:
            return onLeft(e.d);
        case 1:
            return onRight(e.d);
    }
}

;// ./src/Maybe.ts
function Maybe_none() {
    return { v: 0 };
}
function some(value) {
    return { v: 1, d: value };
}
function Maybe_map(m, onNone, onSome) {
    switch (m.v) {
        case 0:
            return onNone();
        case 1:
            return onSome(m.d);
    }
}
function isSome(m) {
    return Maybe_map(m, () => false, _ => true);
}
function isNone(m) {
    return !isSome(m);
}
function Maybe_mapSome(m, onSome) {
    switch (m.v) {
        case 0:
            return Maybe_none();
        case 1:
            return some(onSome(m.d));
    }
}
function then(b, onTrue) {
    if (b) {
        return some(onTrue());
    }
    return Maybe_none();
}
function unwrapOr(m, onNone) {
    return Maybe_map(m, onNone, v => v);
}
function orElse(m, onNone) {
    return Maybe_map(m, onNone, v => some(v));
}
function expect(m, error) {
    return Maybe_map(m, () => { throw new Error(error); }, t => t);
}

;// ./src/Constants.ts
const oneSixthCircle = Math.PI * 2 / 6;
const overallScale = 1;
const Constants_faceSizeGrowthScalar = overallScale * 0.002;
const Constants_branchLengthGrowthScalar = overallScale * 0.0015;
const Constants_branchSizeGrowthScalar = overallScale * 0.0005;
const Constants_yChoices = [-1, -0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75, 1];

;// ./src/Utils.ts





function Utils_rem(x, m) {
    return ((x % m) + m) % m;
}
function clamp(x, low, high) {
    return Math.min(Math.max(x, low), high);
}
function lerp(a, b, n) {
    return (1 - n) * a + n * b;
}
function Utils_fracPart(n) {
    return n % 1;
}
function Utils_makeArray6(f) {
    return [f(), f(), f(), f(), f(), f()];
}
function mapArray6(array, callbackfn, thisArg) {
    return array.map(callbackfn, thisArg);
}
function convertRGBAToString(rgba) {
    const { r, g, b, a } = rgba;
    return `rgba(${r}, ${g}, ${b}, ${a})`;
}
function Utils_randomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
const Utils_sideCacheConstructor = length => new Float64Array(length);
function Utils_interpretGrowth(growthInput, time) {
    let s = lerp(0, growthInput.length - 1, time);
    let n = Utils_fracPart(s);
    let a = yChoices[growthInput[Math.floor(s)]];
    let b = yChoices[growthInput[Math.ceil(s)]];
    let signedScale = lerp(a, b, n);
    // let timeScalar = -0.01 * s + 1;
    return {
        scale: /*timeScalar **/ Math.abs(signedScale),
        growthType: signedScale > 0.0 ? 'branching' : 'faceting',
    };
}
function okOrElse(m, onNone) {
    return Maybe_map(m, () => Either_left(onNone()), v => Either_right(v));
}
function ok(e) {
    return map(e, () => Maybe_none(), r => some(r));
}

;// ./src/Direction.ts


const DIRS = 6;
const values = [
    0 * oneSixthCircle,
    1 * oneSixthCircle,
    2 * oneSixthCircle,
    3 * oneSixthCircle,
    4 * oneSixthCircle,
    5 * oneSixthCircle,
];
const cosines = [
    Math.cos(values[0]),
    Math.cos(values[1]),
    Math.cos(values[2]),
    Math.cos(values[3]),
    Math.cos(values[4]),
    Math.cos(values[5]),
];
const sines = [
    Math.sin(values[0]),
    Math.sin(values[1]),
    Math.sin(values[2]),
    Math.sin(values[3]),
    Math.sin(values[4]),
    Math.sin(values[5]),
];
function next(d) {
    return ((d + 1) % values.length);
}
function previous(d) {
    return rem(d - 1, values.length);
}

;// ./src/Point.ts

function zero() {
    return { x: 0, y: 0 };
}
;
function zeroM(result) {
    result.x = 0;
    result.y = 0;
}
function make(x, y) {
    return { x, y };
}
function copy(p) {
    return { x: p.x, y: p.y };
}
function add(p1, p2) {
    return { x: p1.x + p2.x, y: p1.y + p2.y };
}
function negate(p) {
    return { x: -p.x, y: -p.y };
}
function subtract(p1, p2) {
    return add(p1, negate(p2));
}
function midpoint(p1, p2) {
    return {
        x: p1.x + 0.5 * (p2.x - p1.x),
        y: p1.y + 0.5 * (p2.y - p1.y)
    };
}
/** Returns the point that is `percent` between `p1` and `p2`. `percent`
 * should be `>= 0` and `<= 1`.
 */
function midpointT(p1, p2, percent) {
    return add(scale(p1, 1 - percent), scale(p2, percent));
}
function Point_midpointTN(n1, n2, percent) {
    return n1 * (1 - percent) + n2 * percent;
}
function scale(p, scalar) {
    return { x: scalar * p.x, y: scalar * p.y };
}
function translate(p, direction, distance) {
    return {
        x: p.x + distance * Math.cos(Directions.values[direction]),
        y: p.y + distance * Math.sin(Directions.values[direction]),
    };
}
// Rotates 'point' by 'theta' around (0,0) counterclockwise.
function rotate(point, theta) {
    return {
        x: point.x * Math.cos(theta) - point.y * Math.sin(theta),
        y: point.x * Math.sin(theta) + point.y * Math.cos(theta),
    };
}
function rotateX(x, y, direction) {
    return x * Directions.cosines[direction] - y * Directions.sines[direction];
}
function rotateY(x, y, direction) {
    return x * Directions.sines[direction] + y * Directions.cosines[direction];
}

;// ./src/Face.ts





const SIZE_ZERO = 0.0025;
function Face_zero() {
    return {
        center: Points.zero(),
        size: SIZE_ZERO,
        isFirstFace: true,
        direction: 0,
        growthScale: 1,
        growing: true,
    };
}
;
function Face_zeroM(face) {
    Points.zeroM(face.center);
    face.size = SIZE_ZERO;
    face.isFirstFace = true;
    face.direction = 0;
    face.growthScale = 1;
    face.growing = true;
}
function manualPointNX(centerX, size, absoluteDirection) {
    return centerX + size * Directions.cosines[absoluteDirection];
}
function manualPointNY(centerY, size, absoluteDirection) {
    return centerY + size * Directions.sines[absoluteDirection];
}
function pointNX(face, absoluteDirection) {
    return manualPointNX(face.center.x, face.size, absoluteDirection);
}
function pointNY(face, absoluteDirection) {
    return manualPointNY(face.center.y, face.size, absoluteDirection);
}
function setPointN(result, face, i) {
    const d = (face.direction + i) % Directions.values.length;
    result.x = face.center.x + face.size * Directions.cosines[d];
    result.y = face.center.y + face.size * Directions.sines[d];
}
function setPointNManually(result, direction, center, size, i) {
    const d = (direction + i) % Directions.values.length;
    result.x = center.x + size * Directions.cosines[d];
    result.y = center.y + size * Directions.sines[d];
}
function draw(graphic, face) {
    const d = face.direction;
    const p0x = viewspaceX(graphic, pointNX(face, (d + 0) % 6));
    const p0y = viewspaceY(graphic, pointNY(face, (d + 0) % 6));
    const p1x = viewspaceX(graphic, pointNX(face, (d + 1) % 6));
    const p1y = viewspaceY(graphic, pointNY(face, (d + 1) % 6));
    const p2x = viewspaceX(graphic, pointNX(face, (d + 2) % 6));
    const p2y = viewspaceY(graphic, pointNY(face, (d + 2) % 6));
    const p3x = viewspaceX(graphic, pointNX(face, (d + 3) % 6));
    const p3y = viewspaceY(graphic, pointNY(face, (d + 3) % 6));
    const p4x = viewspaceX(graphic, pointNX(face, (d + 4) % 6));
    const p4y = viewspaceY(graphic, pointNY(face, (d + 4) % 6));
    const p5x = viewspaceX(graphic, pointNX(face, (d + 5) % 6));
    const p5y = viewspaceY(graphic, pointNY(face, (d + 5) % 6));
    if (outsideVisibleArea(graphic, p0x)
        || outsideVisibleArea(graphic, p1x)
        || outsideVisibleArea(graphic, p2x)
        || outsideVisibleArea(graphic, p3x)
        || outsideVisibleArea(graphic, p4x)
        || outsideVisibleArea(graphic, p5x)
        || outsideVisibleArea(graphic, p0y)
        || outsideVisibleArea(graphic, p1y)
        || outsideVisibleArea(graphic, p2y)
        || outsideVisibleArea(graphic, p3y)
        || outsideVisibleArea(graphic, p4y)
        || outsideVisibleArea(graphic, p5y)) {
        return true;
    }
    const ctx = graphic.ctx;
    if (face.isFirstFace) {
        const cx = viewspaceX(graphic, face.center.x);
        const cy = viewspaceY(graphic, face.center.y);
        ctx.moveTo(p0x, p0y);
        ctx.lineTo(p1x, p1y);
        ctx.lineTo(p2x, p2y);
        ctx.lineTo(p3x, p3y);
        ctx.lineTo(p4x, p4y);
        ctx.lineTo(p5x, p5y);
        ctx.lineTo(p0x, p0y);
        ctx.moveTo(cx, cy);
        ctx.lineTo(p0x, p0y);
        ctx.moveTo(cx, cy);
        ctx.lineTo(p1x, p1y);
        ctx.moveTo(cx, cy);
        ctx.lineTo(p2x, p2y);
        ctx.moveTo(cx, cy);
        ctx.lineTo(p3x, p3y);
        ctx.moveTo(cx, cy);
        ctx.lineTo(p4x, p4y);
        ctx.moveTo(cx, cy);
        ctx.lineTo(p5x, p5y);
    }
    else {
        const p31x = midpointTN(p3x, p1x, 0.6);
        const p31y = midpointTN(p3y, p1y, 0.6);
        const p30x = midpointTN(p3x, p0x, 0.6);
        const p30y = midpointTN(p3y, p0y, 0.6);
        const p35x = midpointTN(p3x, p5x, 0.6);
        const p35y = midpointTN(p3y, p5y, 0.6);
        const p45x = midpointTN(p4x, p5x, 0.6);
        const p45y = midpointTN(p4y, p5y, 0.6);
        const p21x = midpointTN(p2x, p1x, 0.6);
        const p21y = midpointTN(p2y, p1y, 0.6);
        ctx.moveTo(p45x, p45y);
        ctx.lineTo(p5x, p5y);
        ctx.moveTo(p21x, p21y);
        ctx.lineTo(p1x, p1y);
        ctx.moveTo(p5x, p5y);
        ctx.lineTo(p0x, p0y);
        ctx.lineTo(p1x, p1y);
        ctx.moveTo(p31x, p31y);
        ctx.lineTo(p1x, p1y);
        ctx.moveTo(p30x, p30y);
        ctx.lineTo(p0x, p0y);
        ctx.moveTo(p35x, p35y);
        ctx.lineTo(p5x, p5y);
    }
    return false;
}
function enlarge(face, scale) {
    face.size += scale * faceSizeGrowthScalar * face.growthScale;
    if (!face.isFirstFace) {
        const dx = scale * faceSizeGrowthScalar * Math.cos(Directions.values[face.direction]) * face.growthScale;
        const dy = scale * faceSizeGrowthScalar * Math.sin(Directions.values[face.direction]) * face.growthScale;
        face.center.x += dx;
        face.center.y += dy;
    }
}

;// ./src/Branch.ts







function Branch_zero() {
    return {
        start: Points.zero(),
        size: 0,
        length: 0,
        direction: 0,
        growthScale: 0,
        growing: false,
    };
}
function endCenterX(branch) {
    return branch.start.x + branch.length * Directions.cosines[branch.direction];
}
function endCenterY(branch) {
    return branch.start.y + branch.length * Directions.sines[branch.direction];
}
function Branch_pointNX(branch, absoluteDirection) {
    const d = rem(absoluteDirection - branch.direction, Directions.values.length);
    if (d === 5 || d === 0 || d === 1) {
        return Faces.manualPointNX(endCenterX(branch), branch.size, absoluteDirection);
    }
    return Faces.manualPointNX(branch.start.x, branch.size, absoluteDirection);
}
function Branch_pointNY(branch, absoluteDirection) {
    const d = rem(absoluteDirection - branch.direction, Directions.values.length);
    if (d === 5 || d === 0 || d === 1) {
        return Faces.manualPointNY(endCenterY(branch), branch.size, absoluteDirection);
    }
    return Faces.manualPointNY(branch.start.y, branch.size, absoluteDirection);
}
function Branch_draw(graphic, branch) {
    const d = branch.direction;
    const p0x = viewspaceX(graphic, Branch_pointNX(branch, (d + 0) % 6));
    const p0y = viewspaceY(graphic, Branch_pointNY(branch, (d + 0) % 6));
    const p1x = viewspaceX(graphic, Branch_pointNX(branch, (d + 1) % 6));
    const p1y = viewspaceY(graphic, Branch_pointNY(branch, (d + 1) % 6));
    const p2x = viewspaceX(graphic, Branch_pointNX(branch, (d + 2) % 6));
    const p2y = viewspaceY(graphic, Branch_pointNY(branch, (d + 2) % 6));
    const p3x = viewspaceX(graphic, Branch_pointNX(branch, (d + 3) % 6));
    const p3y = viewspaceY(graphic, Branch_pointNY(branch, (d + 3) % 6));
    const p4x = viewspaceX(graphic, Branch_pointNX(branch, (d + 4) % 6));
    const p4y = viewspaceY(graphic, Branch_pointNY(branch, (d + 4) % 6));
    const p5x = viewspaceX(graphic, Branch_pointNX(branch, (d + 5) % 6));
    const p5y = viewspaceY(graphic, Branch_pointNY(branch, (d + 5) % 6));
    if (outsideVisibleArea(graphic, p0x)
        || outsideVisibleArea(graphic, p1x)
        || outsideVisibleArea(graphic, p2x)
        || outsideVisibleArea(graphic, p3x)
        || outsideVisibleArea(graphic, p4x)
        || outsideVisibleArea(graphic, p5x)
        || outsideVisibleArea(graphic, p0y)
        || outsideVisibleArea(graphic, p1y)
        || outsideVisibleArea(graphic, p2y)
        || outsideVisibleArea(graphic, p3y)
        || outsideVisibleArea(graphic, p4y)
        || outsideVisibleArea(graphic, p5y)) {
        return true;
    }
    const p45x = midpointTN(p4x, p5x, 0);
    const p45y = midpointTN(p4y, p5y, 0);
    const p21x = midpointTN(p2x, p1x, 0);
    const p21y = midpointTN(p2y, p1y, 0);
    const ctx = graphic.ctx;
    ctx.moveTo(p5x, p5y);
    ctx.lineTo(p0x, p0y);
    ctx.lineTo(p1x, p1y);
    ctx.moveTo(p45x, p45y);
    ctx.lineTo(p5x, p5y);
    ctx.moveTo(p21x, p21y);
    ctx.lineTo(p1x, p1y);
    ctx.moveTo(p0x, p0y);
    ctx.lineTo(p3x, p3y);
    return false;
}
function Branch_enlarge(branch, scale) {
    // const lengthScalar = -1.5 * scale + 1.5;
    // const sizeScalar = 1.5 * scale;
    branch.size += branchSizeGrowthScalar * branch.growthScale;
    branch.length += branchLengthGrowthScalar * branch.growthScale;
}

;// ./src/Side2D.ts



// The functions in this file return coordinates of endpoints of lines in a part.
// The nth side of a part is defined in the following way:
//         1
//       -----
//    2 /     \  0
//     /       \
//     \       /
//   3  \     /  5
//       -----
//         4
// The 'left' point on a side is the one that is more counterclockwise. So, for
// example, the left point of side zero is the right point of side one.
//
// These functions do not take into consideration the 'direction' of the parts.
function faceSideNLeftX(face, absoluteSideIndex) {
    return Faces.pointNX(face, (absoluteSideIndex + 1) % Directions.values.length);
}
function faceSideNLeftY(face, absoluteSideIndex) {
    return Faces.pointNY(face, (absoluteSideIndex + 1) % Directions.values.length);
}
function faceSideNRightX(face, absoluteSideIndex) {
    return Faces.pointNX(face, absoluteSideIndex);
}
function faceSideNRightY(face, absoluteSideIndex) {
    return Faces.pointNY(face, absoluteSideIndex);
}
function branchSideNLeftX(branch, absoluteSideIndex) {
    return Branches.pointNX(branch, (absoluteSideIndex + 1) % Directions.values.length);
}
function branchSideNLeftY(branch, absoluteSideIndex) {
    return Branches.pointNY(branch, (absoluteSideIndex + 1) % Directions.values.length);
}
function branchSideNRightX(branch, absoluteSideIndex) {
    return Branches.pointNX(branch, absoluteSideIndex);
}
function branchSideNRightY(branch, absoluteSideIndex) {
    return Branches.pointNY(branch, absoluteSideIndex);
}

;// ./src/Side.ts




function normalizeSide2DFaceM(resultLeft, resultRight, resultHeight, partIndex, face, absoluteDirection) {
    const d = rem(1 - absoluteDirection, Directions.values.length);
    const side2dLeftX = Side2Ds.faceSideNLeftX(face, absoluteDirection);
    const side2dLeftY = Side2Ds.faceSideNLeftY(face, absoluteDirection);
    const side2dRightX = Side2Ds.faceSideNRightX(face, absoluteDirection);
    const side2dRightY = Side2Ds.faceSideNRightY(face, absoluteDirection);
    resultLeft[partIndex] = Points.rotateX(side2dLeftX, side2dLeftY, d);
    resultRight[partIndex] = Points.rotateX(side2dRightX, side2dRightY, d);
    resultHeight[partIndex] = Points.rotateY(side2dLeftX, side2dLeftY, d);
}
function normalizeSide2DBranchM(resultLeft, resultRight, resultHeight, partIndex, branch, absoluteDirection) {
    const d = rem(1 - absoluteDirection, Directions.values.length);
    const side2dLeftX = Side2Ds.branchSideNLeftX(branch, absoluteDirection);
    const side2dLeftY = Side2Ds.branchSideNLeftY(branch, absoluteDirection);
    const side2dRightX = Side2Ds.branchSideNRightX(branch, absoluteDirection);
    const side2dRightY = Side2Ds.branchSideNRightY(branch, absoluteDirection);
    resultLeft[partIndex] = Points.rotateX(side2dLeftX, side2dLeftY, d);
    resultRight[partIndex] = Points.rotateX(side2dRightX, side2dRightY, d);
    resultHeight[partIndex] = Points.rotateY(side2dLeftX, side2dLeftY, d);
}
function normalizeFaceRelativeSide2DsM(resultLeft, resultRight, resultHeight, partIndex, face) {
    for (let i = 0; i < Directions.values.length; ++i) {
        normalizeSide2DFaceM(resultLeft[i], resultRight[i], resultHeight[i], partIndex, face, i);
    }
}
function normalizeBranchRelativeSide2DsM(resultLeft, resultRight, resultHeight, partIndex, branch) {
    for (let i = 0; i < Directions.values.length; ++i) {
        normalizeSide2DBranchM(resultLeft[i], resultRight[i], resultHeight[i], partIndex, branch, i);
    }
}
function overlapDistance(height1, height2) {
    return height1 - height2;
}
// Returns 'true' if the line segments l1...r1 and l2...r2 overlap.
function overlaps(l1, r1, l2, r2) {
    // s1 ---......
    // s2       ......---
    //    and
    // s1       ......--- 
    // s2 ---......
    return l1 < r2 && l2 < r1;
}

;// ./src/Snowflake.ts





// Description of the Overlap Detection Algorithm
//
// To prevent the snowflake from growing through itself, we must kill parts
// of the snowflake which are underneath other parts. We take advantage of
// the fact that each side of every part is oriented in one of six directions.
// There are no lines in worldspace coordinates which are of a different
// orientation. (of course, when it comes to drawing the snowflake, we can
// draw lines however we want).
//
// Determining if two horizontal line segments overlap each other is simple,
// and is what 'killPartIfCoveredInOneDirection' (specifically, Sides.overlaps())
// does. This function takes a part and its horizontal side and does a linear 
// search through the horizontal sides of every other part, using Sides.overlaps()
// to check if the sides of the given part are below any other sides. It kills
// the part if its side is below any other side.
//
// Of course, there are four other orientations of sides which we have to worry
// about which are not horizontal. To make our lives easier, we simply rotate each
// of the sides of every part around the origin until they are horizontal, storing
// the resulting sides in the SideCache. This rotation process is called
// 'normalization', and is performed by 'cacheNormalizedSides'. Since every side
// is now horizontal, we can use the same simple horizontal-based killing
// algorithm on each side of every part.
//
// The overlap detection algorithm only checks if two out of the six sides of a
// given part are underneath all the other sides in their orientations. These
// two sides are the sides that are facing in the direction in which the part is
// growing. This is not for efficiency; if we checked all sides, parts would stop
// growing because of parts behind them.
//
// This algorithm is run once for every update, so it must be as fast as possible.
// There are several optimizations to ensure it runs at peak performance. These
// optimizations are enough to make it so that the draw rate of snowflakes is
// no longer bottlenecked by this algorithm but instead by the speed of 
// CanvasRenderingContext2D moveTo() and lineTo() calls (at least on my computer).
// Here are a list of optimzations we do here:
//
// 1. No objects are allocated during the overlap detection algorithm. Algorithms 
//    which return information about the location of points or sides do so by 
//    directly returning numbers instead of returning Point or Side objects.
//
// 2. The snowflake stores Faces and Branches in two separate arrays. Older Faces
//    and older branches occur at the beginning of these arrays. Since these older
//    parts have likely already been killed, we cache the number of initial grown
//    faces and branches. This is used by forEachGrowing{Face,Branch} to 'skip over'
//    these killed parts, reducing needless conditional checks. This information is
//    stored in the snowflake as 'numInitialGrown{Faces,Branches}'.
//
// 3. The SideCache and the arrays of Faces and Branches are never freed, and they
//    never free their elements. We store the number of valid Faces and Branches
//    in the Snowflake as 'num{Faces,Branches}'. It is updated in-place. When
//    resetting the snowflake, we simply set 'num{Faces,Branches}' to zero.
//
// 4. The SideCache and the arrays of Faces and Branches are preallocated to their
//    maximum sizes to eliminate reallocations. NOTE: in V8, it seems like this is
//    okay to do because our maximum size is not gigantic. If it were, say, more
//    64 thousand elements, V8 would change its representation to a sparse array
//    which would incur costly array type transformations when we got around to
//    populating it with real data. (At lease, that's what I've heard).
//
// 5. The SideCache stores numbers directly instead of storing Side or Point
//    objects. This way, the JS engine can store them as arrays of unboxed doubles 
//    instead of arrays of pointers to objects with properties which are doubles.
//
// 6. 'reduce_funcs' in Webpack's TerserPlugin is disabled. This option, when
//    enabled, transforms code like this:
//
//    | export function normalizeSide2DFaceM(
//    |   resultLeft: SideCacheArray,
//    |   resultRight: SideCacheArray,
//    |   resultHeight: SideCacheArray,
//    |   partIndex: number,
//    |   face: Face,
//    |   absoluteDirection: number
//    | ): void {
//    |   const d = rem(1 - absoluteDirection, Directions.values.length) as Direction;
//    |   const side2dLeftX = Side2Ds.faceSideNLeftX(face, absoluteDirection);
//    |   const side2dLeftY = Side2Ds.faceSideNLeftY(face, absoluteDirection);
//    |   const side2dRightX = Side2Ds.faceSideNRightX(face, absoluteDirection);
//    |   const side2dRightY = Side2Ds.faceSideNRightY(face, absoluteDirection);
//    |   resultLeft[partIndex] = Points.rotateX(side2dLeftX, side2dLeftY, d);
//    |   resultRight[partIndex] = Points.rotateX(side2dRightX, side2dRightY, d);
//    |   resultHeight[partIndex] = Points.rotateY(side2dLeftX, side2dLeftY, d);
//    | }
//
//    Into code like this:
//
//    | function normalizeSide2DFaceM(resultLeft, resultRight, resultHeight, partIndex, face, absoluteDirection) {
//    |   const d = Utils_rem(1 - absoluteDirection, values.length)
//    |     , side2dLeftX = function(face, absoluteSideIndex) {
//    |       return pointNX(face, (absoluteSideIndex + 1) % values.length)
//    |   }(face, absoluteDirection)
//    |     , side2dLeftY = function(face, absoluteSideIndex) {
//    |       return pointNY(face, (absoluteSideIndex + 1) % values.length)
//    |   }(face, absoluteDirection)
//    |     , side2dRightX = function(face, absoluteSideIndex) {
//    |       return pointNX(face, absoluteSideIndex)
//    |   }(face, absoluteDirection)
//    |     , side2dRightY = function(face, absoluteSideIndex) {
//    |       return pointNY(face, absoluteSideIndex)
//    |   }(face, absoluteDirection);
//    |   resultLeft[partIndex] = rotateX(side2dLeftX, side2dLeftY, d),
//    |   resultRight[partIndex] = rotateX(side2dRightX, side2dRightY, d),
//    |   resultHeight[partIndex] = rotateY(side2dLeftX, side2dLeftY, d)
//    | }
//
//    Using Chrome's performance profiler, the effect of this transformation seems
//    to be that 'normalizeSide2DFaceM' now allocates closures which are then
//    immediately applied (and need to then be freed by the garbage collector).
//    The code with this option turned off seems to not need to perform any allocations.
//
// Historical note: the original overlap detection algorithm used a 'ray tracing'
// strategy to find covered parts. This algorithm shot 'rays' from all around
// the snowflake at its center, stopping each ray at the first part hit. Parts
// which were not hit by rays were considered to be covered, and were subsequently
// killed. The problem with this approach is that it was hard for rays to hit very
// small parts (i.e., newly sprouted Branches and Faces). To stop these parts from
// being killed, a large number of rays was needed. Even allowing for some
// optimization tricks, this proved to be way too slow. The speed that snowflakes
// could grow at using the ray tracing algorithm was measured in tens of seconds.
// With the new algorithm, snowflakes grow in less than 10 milliseconds.
const MAX_FACES = 10000;
const MAX_BRANCHES = 10000;
const FACE_LEFT_CACHE = 0;
const FACE_RIGHT_CACHE = 1;
const FACE_HEIGHT_CACHE = 2;
const BRANCH_LEFT_CACHE = 3;
const BRANCH_RIGHT_CACHE = 4;
const BRANCH_HEIGHT_CACHE = 5;
function addFaceM(snowflake, centerX, centerY, size, isFirstFace, direction, growthScale, growing) {
    if (snowflake.numFaces < MAX_FACES) {
        const f = snowflake.faces[snowflake.numFaces];
        f.center.x = centerX;
        f.center.y = centerY;
        f.size = size;
        f.isFirstFace = isFirstFace;
        f.direction = direction;
        f.growthScale = growthScale;
        f.growing = growing;
        snowflake.numFaces += 1;
        return false;
    }
    return true;
}
function addBranchM(snowflake, startX, startY, size, length, direction, growthScale, growing) {
    if (snowflake.numBranches < MAX_BRANCHES) {
        const b = snowflake.branches[snowflake.numBranches];
        b.start.x = startX;
        b.start.y = startY;
        b.size = size;
        b.length = length;
        b.direction = direction;
        b.growthScale = growthScale;
        b.growing = growing;
        snowflake.numBranches += 1;
        return false;
    }
    return true;
}
function forEachFace(snowflake, f) {
    for (let i = 0; i < snowflake.numFaces; ++i) {
        f(snowflake.faces[i], i);
    }
}
function forEachBranch(snowflake, f) {
    for (let i = 0; i < snowflake.numBranches; ++i) {
        f(snowflake.branches[i], i);
    }
}
const oneZeroArray = (/* unused pure expression or super */ null && ([1, 0]));
function forEachGrowingFace(snowflake, f) {
    for (let i = snowflake.numInitialGrownFaces; i < snowflake.numFaces; ++i) {
        const face = snowflake.faces[i];
        if (!face.growing) {
            snowflake.numInitialGrownFaces += oneZeroArray[Math.min(1, i - snowflake.numInitialGrownFaces)];
            continue;
        }
        f(snowflake.faces[i], i);
    }
}
function forEachGrowingBranch(snowflake, f) {
    for (let i = snowflake.numInitialGrownBranches; i < snowflake.numBranches; ++i) {
        const branch = snowflake.branches[i];
        if (!branch.growing) {
            snowflake.numInitialGrownBranches += oneZeroArray[Math.min(1, i - snowflake.numInitialGrownBranches)];
            continue;
        }
        f(snowflake.branches[i], i);
    }
}
function Snowflake_draw(graphic, snowflake) {
    let anyPartOutside = false;
    graphic.ctx.strokeStyle = `rgba(255, 255, 255, 0.08)`;
    graphic.ctx.beginPath();
    forEachGrowingFace(snowflake, (f, _) => anyPartOutside || (anyPartOutside = Faces.draw(graphic, f)));
    forEachGrowingBranch(snowflake, (b, _) => anyPartOutside || (anyPartOutside = Branches.draw(graphic, b)));
    graphic.ctx.stroke();
    return anyPartOutside;
}
function zeroParts(maxParts, zeroPart) {
    const result = [];
    for (let i = 0; i < maxParts; ++i) {
        result[i] = zeroPart();
    }
    return result;
}
function sideCacheZeroFunc(length) {
    return () => sideCacheConstructor(length);
}
function Snowflake_zero() {
    const mkFaceCache = sideCacheZeroFunc(MAX_FACES);
    const mkBranchCache = sideCacheZeroFunc(MAX_BRANCHES);
    const sideCaches = [
        makeArray6(mkFaceCache),
        makeArray6(mkFaceCache),
        makeArray6(mkFaceCache),
        makeArray6(mkBranchCache),
        makeArray6(mkBranchCache),
        makeArray6(mkBranchCache),
    ];
    const faces = zeroParts(MAX_FACES, Faces.zero);
    const branches = zeroParts(MAX_BRANCHES, Branches.zero);
    return {
        faces,
        branches,
        numFaces: 1,
        numBranches: 0,
        sideCaches,
        numInitialGrownFaces: 0,
        numInitialGrownBranches: 0,
    };
}
function Snowflake_zeroM(s) {
    s.numFaces = 1;
    Faces.zeroM(s.faces[0]);
    s.numBranches = 0;
    s.numInitialGrownFaces = 0;
    s.numInitialGrownBranches = 0;
}
const branchSplittingGrowthScales = (/* unused pure expression or super */ null && ([0.5, 0.9, 0.5]));
function addBranchesToFace(snowflake, face) {
    const initialFraction = 0.01;
    const sizeOfNewBranches = face.size * initialFraction;
    // This is the offset from the edge of the face that we add to the start of the branch
    // so that it does not overlap the face itself when it is first created. Without this,
    // overlap detection immediatelly kills freshly created branches.
    const safetyOffset = 0.001;
    const distFromCenter = safetyOffset + 1 * face.size * (1 - initialFraction);
    const cx = face.center.x;
    const cy = face.center.y;
    if (face.isFirstFace) {
        const growthScale = branchSplittingGrowthScales[1];
        for (let i = 0; i < 6; ++i) {
            addBranchM(snowflake, cx + distFromCenter * Directions.cosines[i], cy + distFromCenter * Directions.sines[i], sizeOfNewBranches, 0, i, growthScale, true);
        }
    }
    else {
        for (let k = -1; k < 2; ++k) {
            const growthScale = face.growthScale * branchSplittingGrowthScales[k + 1];
            const i = rem(face.direction + k, 6);
            addBranchM(snowflake, cx + distFromCenter * Directions.cosines[i], cy + distFromCenter * Directions.sines[i], sizeOfNewBranches, 0, i, growthScale, true);
        }
    }
}
function Snowflake_addBranchesToGrowingFaces(snowflake) {
    forEachGrowingFace(snowflake, (face, _) => {
        addBranchesToFace(snowflake, face);
        face.growing = false;
    });
}
function addFaceToBranch(snowflake, branch) {
    addFaceM(snowflake, Branches.endCenterX(branch), Branches.endCenterY(branch), branch.size, false, branch.direction, branch.growthScale, true);
}
function Snowflake_addFacesToGrowingBranches(snowflake) {
    forEachGrowingBranch(snowflake, (branch, _) => {
        addFaceToBranch(snowflake, branch);
        branch.growing = false;
    });
}
function cacheNormalizedSides(snowflake) {
    forEachGrowingFace(snowflake, (f, fi) => {
        Sides.normalizeFaceRelativeSide2DsM(snowflake.sideCaches[FACE_LEFT_CACHE], snowflake.sideCaches[FACE_RIGHT_CACHE], snowflake.sideCaches[FACE_HEIGHT_CACHE], fi, f);
    });
    forEachGrowingBranch(snowflake, (b, bi) => {
        Sides.normalizeBranchRelativeSide2DsM(snowflake.sideCaches[BRANCH_LEFT_CACHE], snowflake.sideCaches[BRANCH_RIGHT_CACHE], snowflake.sideCaches[BRANCH_HEIGHT_CACHE], bi, b);
    });
}
function killPartIfCoveredInOneDirection(part, partIndex, sideLeftCache, sideRightCache, sideHeightCache, otherLeftSideCache, otherRightSideCache, otherHeightSideCache, numOtherSides, otherCacheContainsPart) {
    const sl = sideLeftCache[partIndex];
    const sr = sideRightCache[partIndex];
    for (let oi = 0; oi < numOtherSides && part.growing; ++oi) {
        const ol = otherLeftSideCache[oi];
        const or = otherRightSideCache[oi];
        const overlaps = Sides.overlaps(ol, or, sl, sr);
        if (overlaps
            && otherHeightSideCache[oi] - sideHeightCache[partIndex] > 0
            && !(otherCacheContainsPart && oi === partIndex)) {
            part.growing = false;
            break;
        }
    }
}
function killPartIfCoveredInOneOfTwoDirections(caches, numFaces, numBranches, left, right, part, partIndex, partIsFace) {
    const partCache = partIsFace ? 0 : 3;
    const plc = caches[partCache];
    const prc = caches[partCache + 1];
    const phc = caches[partCache + 2];
    for (let otherPartCache = 0; otherPartCache < 4; otherPartCache += 3) {
        const numOtherSides = otherPartCache === 0 ? numFaces : numBranches;
        const otherCacheContainsPart = partCache === otherPartCache;
        const olc = caches[otherPartCache];
        const orc = caches[otherPartCache + 1];
        const ohc = caches[otherPartCache + 2];
        for (let leftOrRight = 0; leftOrRight < 2; ++leftOrRight) {
            const d = leftOrRight === 0 ? left : right;
            const plcd = plc[d];
            const prcd = prc[d];
            const phcd = phc[d];
            const olcd = olc[d];
            const orcd = orc[d];
            const ohcd = ohc[d];
            killPartIfCoveredInOneDirection(part, partIndex, plcd, prcd, phcd, olcd, orcd, ohcd, numOtherSides, otherCacheContainsPart);
            if (!part.growing) {
                return;
            }
        }
    }
}
function killPartIfCovered(part, partIndex, caches, numFaces, numBranches, partIsFace) {
    const d = part.direction;
    const leftDirection = d;
    const rightDirection = rem(d - 1, Directions.values.length);
    killPartIfCoveredInOneOfTwoDirections(caches, numFaces, numBranches, leftDirection, rightDirection, part, partIndex, partIsFace);
}
function killCoveredFaces(snowflake) {
    forEachGrowingFace(snowflake, (f, fi) => {
        killPartIfCovered(f, fi, snowflake.sideCaches, snowflake.numFaces, snowflake.numBranches, true);
    });
}
function killCoveredBranches(snowflake) {
    forEachGrowingBranch(snowflake, (b, bi) => {
        killPartIfCovered(b, bi, snowflake.sideCaches, snowflake.numFaces, snowflake.numBranches, false);
    });
}

;// ./src/State.ts








function State_reset(state) {
    Snowflakes.zeroM(state.snowflake);
    state.currentGrowthType = undefined;
    state.growing = true;
    state.updateBank = 0;
    state.updateCount = 0;
    state.currentMS = performance.now();
    state.resetStartTime = performance.now();
    mapSome(state.graphic, g => Graphics.clear(g));
    state.resetCallback();
    scheduleUpdate(state);
}
function setSnowflakeCanvasSizePX(state, snowflakeCanvasSizePX) {
    Maybe_mapSome(state.graphic, g => {
        g.sizePX = snowflakeCanvasSizePX;
        g.ctx.canvas.width = snowflakeCanvasSizePX;
        g.ctx.canvas.height = snowflakeCanvasSizePX;
        g.canvas.style.width = `${snowflakeCanvasSizePX}px`;
        g.canvas.style.height = `${snowflakeCanvasSizePX}px`;
    });
    return isSome(state.graphic);
}
function initializeGraphic(state, snowflakeCanvasSizePX) {
    return Maybes.orElse(state.graphic, () => {
        state.graphic = Graphics.make(snowflakeCanvasSizePX);
        return state.graphic;
    });
}
function scheduleUpdate(state) {
    if (state.hasScheduledUpdate) {
        return;
    }
    else if (state.growing && state.playing) {
        state.hasScheduledUpdate = true;
        setTimeout(state.updateOnNextFrame, state.idealMSBetweenUpdates);
    }
    else {
        state.hasScheduledUpdate = false;
    }
}
function setIdealMSBetweenUpdates(state, targetGrowthTimeMS, upsCap) {
    state.idealMSBetweenUpdates = Math.max(1000 / upsCap, targetGrowthTimeMS / state.maxUpdates);
}
function State_zero() {
    const snowflake = Snowflakes.zero();
    // These defaults are overwritten in Controller which synchronizes
    // this state with the default Config. It's the values in the 
    // default Config that matter.
    const result = {
        growthInput: [0],
        graphic: none(),
        snowflake,
        currentGrowthType: undefined,
        growing: true,
        updateBank: 0,
        updateCount: 0,
        currentMS: 0,
        idealMSBetweenUpdates: 0,
        maxUpdates: 500,
        resetStartTime: performance.now(),
        playing: false,
        finishedGrowingCallback: () => { return; },
        resetCallback: () => { return; },
        installSnowflakeCanvasCallback: _ => { return; },
        installSnowflakeCanvasFailureCallback: () => { return; },
        hasScheduledUpdate: false,
        updateOnNextFrame: () => { requestAnimationFrame(result.doUpdate); },
        doUpdate: () => {
            update(result);
            result.hasScheduledUpdate = false;
            scheduleUpdate(result);
        }
    };
    scheduleUpdate(result);
    return result;
}
function currentTime(state) {
    return state.updateCount / state.maxUpdates;
}
function update(state) {
    const { snowflake, graphic, } = state;
    const lastMS = state.currentMS;
    state.currentMS = performance.now();
    const deltaMS = state.currentMS - lastMS;
    let requiredUpdates = Math.min(state.maxUpdates - state.updateCount, deltaMS / state.idealMSBetweenUpdates + state.updateBank);
    state.updateBank = fracPart(requiredUpdates);
    requiredUpdates = Math.floor(requiredUpdates);
    function doUpdate() {
        const growth = interpretGrowth(state.growthInput, currentTime(state));
        if (state.currentGrowthType === undefined) {
            state.currentGrowthType = growth.growthType;
        }
        if (state.currentGrowthType !== growth.growthType) {
            state.currentGrowthType = growth.growthType;
            if (state.currentGrowthType === 'branching') {
                addBranchesToGrowingFaces(snowflake);
            }
            else {
                addFacesToGrowingBranches(snowflake);
            }
        }
        Snowflakes.cacheNormalizedSides(snowflake);
        if (state.currentGrowthType === 'branching') {
            Snowflakes.killCoveredBranches(snowflake);
            Snowflakes.forEachGrowingBranch(snowflake, (b, _) => Branches.enlarge(b, growth.scale));
        }
        else {
            Snowflakes.killCoveredFaces(snowflake);
            Snowflakes.forEachGrowingFace(snowflake, (f, _) => Faces.enlarge(f, growth.scale));
        }
        mapSome(state.graphic, g => {
            if (Snowflakes.draw(g, snowflake)) {
                state.updateCount = state.maxUpdates;
                state.updateBank = 0;
                let v = window;
                if (v.count === undefined) {
                    v.count = 0;
                }
                v.count += 1;
                console.log(`too large count = ${v.count}, ${state.growthInput}`);
            }
        });
    }
    for (let i = 0; i < requiredUpdates; ++i) {
        doUpdate();
        state.updateCount += 1;
    }
    if (state.updateCount >= state.maxUpdates) {
        state.finishedGrowingCallback();
        state.growing = false;
    }
}

;// ./src/Config.ts






function isBoolean(value) {
    return typeof value === 'boolean';
}
function isFunction(value) {
    return typeof value === 'function';
}
function isFunctionN(value, argCount) {
    return isFunction(value) && value.length === argCount;
}
function isFunction0(value) {
    return isFunctionN(value, 0);
}
function isFunction1(value) {
    return isFunctionN(value, 1);
}
function parseSnowflakeID(value) {
    if (value.toString === undefined) {
        return Either_left('integer or string containing digits [1-9]');
    }
    const digits = value.toString();
    const result = [];
    for (let i = 0; i < digits.length; ++i) {
        const digit = parseInt(digits[i], 10);
        if (Number.isNaN(digit)) {
            return Either_left('integer or string containing digits [1-9]');
        }
        if (digit === 0) {
            return Either_left('integer or string containing digits [1-9]');
        }
        const parsedDigit = digit - 1;
        result.push(parsedDigit);
    }
    if (result.length === 0) {
        return Either_left('integer or string containing at least one nonzero digit');
    }
    return Either_right(result);
}
function parseNat(value) {
    if (!Number.isSafeInteger(value)) {
        return Either_left('integer');
    }
    if (value < 0) {
        return Either_left('nonnegative integer');
    }
    return Either_right(value);
}
function makeParser(predicate, expected) {
    return v => okOrElse(then(predicate(v), () => v), () => expected);
}
const parseBool = makeParser(isBoolean, 'boolean');
const parseFunction0 = makeParser(isFunction0, 'function requiring no arguments');
const parseFunction1 = makeParser(isFunction1, 'function requiring one argument');
const configParser = {
    snowflakeID: parseSnowflakeID,
    snowflakeCanvasSizePX: parseNat,
    targetGrowthTimeMS: parseNat,
    upsCap: parseNat,
    maxUpdates: parseNat,
    playing: parseBool,
    finishedGrowingCallback: parseFunction0,
    resetCallback: parseFunction0,
    installSnowflakeCanvasCallback: parseFunction1,
    installSnowflakeCanvasFailureCallback: parseFunction0,
};
function isObject(value) {
    return typeof value === 'object' && !Array.isArray(value) && value !== null;
}
function parseConfig(u) {
    const errors = [];
    const parser = configParser;
    const result = {};
    if (!isObject(u)) {
        errors.push({ expected: 'object', actual: JSON.stringify(u) });
        return left(errors);
    }
    if (errors.length > 0) {
        return left(errors);
    }
    for (let [k, v] of Object.entries(u)) {
        const kParser = parser[k];
        if (kParser === undefined) {
            errors.push({ expected: `object without key '${k}'`, actual: u });
        }
        else {
            const r = kParser(v);
            Eithers.map(r, expectedType => errors.push({ expected: `${k} to be ${expectedType}`, actual: v }), parsed => result[k] = parsed);
        }
    }
    if (errors.length > 0) {
        return left(errors);
    }
    return right(result);
}
function parseErrorString(e) {
    return `expected ${e.expected}, received ${e.actual}`;
}
function parseErrorsString(e) {
    return 'errors detected when validating config\n' + e.map(parseErrorString).join('\n');
}
function parseConfigAndDisplayErrors(u) {
    return Eithers.map(parseConfig(u), errors => { throw new Error(parseErrorsString(errors)); }, config => config);
}
function snowflakeIDString(id) {
    return id.map(n => n + 1).join('');
}
function randomSnowflakeId() {
    const id = [randomIntInclusive(0, 3)];
    for (let i = 1; i < 16; i++) {
        id.push(randomIntInclusive(0, 8));
    }
    return Eithers.map(parseSnowflakeID(snowflakeIDString(id)), _err => { throw new Error(`randomSnowflakeId returned invalid ID: '${id}'`); }, _id => id);
}
function randomSnowflakeIDString() {
    return snowflakeIDString(randomSnowflakeId());
}
function Config_zero() {
    return parseConfigAndDisplayErrors({
        snowflakeID: randomSnowflakeIDString(),
        snowflakeCanvasSizePX: 800,
        targetGrowthTimeMS: 8000,
        upsCap: 60,
        maxUpdates: 500,
        playing: true,
        finishedGrowingCallback: () => { return; },
        resetCallback: () => { return; },
        installSnowflakeCanvasCallback: (canvas) => document.body.appendChild(canvas),
        installSnowflakeCanvasFailureCallback: () => { throw new Error('error installing snowflake canvas'); },
    });
}
const configSynchronizer = {
    snowflakeID: (_c, s, newValue, oldValue) => {
        const newEqOld = Maybe_map(oldValue, () => false, oldValue => newValue === oldValue);
        if (!newEqOld) {
            s.growthInput = newValue;
            return true;
        }
        return false;
    },
    snowflakeCanvasSizePX: (_c, s, newValue, oldValue) => {
        return Maybe_map(oldValue, () => setSnowflakeCanvasSizePX(s, newValue), oldValue => {
            if (newValue !== oldValue) {
                return setSnowflakeCanvasSizePX(s, newValue);
            }
            return false;
        });
    },
    targetGrowthTimeMS: (c, s, newValue, oldValue) => {
        setIdealMSBetweenUpdates(s, newValue, c.upsCap);
        return false;
    },
    upsCap: (c, s, newValue, oldValue) => {
        setIdealMSBetweenUpdates(s, c.targetGrowthTimeMS, newValue);
        return false;
    },
    maxUpdates: (_c, s, newValue, oldValue) => {
        return Maybe_map(oldValue, () => {
            s.maxUpdates = newValue;
            return true;
        }, oldValue => {
            if (newValue !== oldValue) {
                s.maxUpdates = newValue;
                return true;
            }
            return false;
        });
    },
    playing: (_c, s, newValue, oldValue) => {
        const newEqOld = Maybe_map(oldValue, () => false, oldValue => newValue === oldValue);
        if (!newEqOld) {
            s.playing = newValue;
            s.currentMS = performance.now();
            scheduleUpdate(s);
        }
        return false;
    },
    finishedGrowingCallback: (_c, s, newValue, _oldValue) => {
        s.finishedGrowingCallback = newValue;
        return false;
    },
    resetCallback: (_c, s, newValue, _oldValue) => {
        s.resetCallback = newValue;
        return false;
    },
    installSnowflakeCanvasCallback: (_c, s, newValue, _oldValue) => {
        s.installSnowflakeCanvasCallback = newValue;
        return false;
    },
    installSnowflakeCanvasFailureCallback: (_c, s, newValue, _oldValue) => {
        s.installSnowflakeCanvasFailureCallback = newValue;
        return false;
    },
};
function sync(oldConfig, newConfig, state) {
    const cs = configSynchronizer;
    let needsReset = false;
    for (let [k, v] of Object.entries(newConfig)) {
        const oldValue = Maybes.mapSome(oldConfig, old => old[k]);
        needsReset = cs[k](newConfig, state, v, oldValue) || needsReset;
    }
    if (needsReset) {
        States.reset(state);
    }
}

;// ./src/SnowflakeGraph.ts




const SVG_NS = 'http://www.w3.org/2000/svg';
const SIZE_SCALAR = 0.5;
const VIEWPORT_WIDTH = 600;
const VIEWPORT_HEIGHT = 200;
const HANDLE_OUTER_HOVER_SCALE = 1.5;
const HANDLE_OUTER_SIZE = SIZE_SCALAR * 15;
const HANDLE_OUTER_HOVERED_SIZE = HANDLE_OUTER_SIZE * HANDLE_OUTER_HOVER_SCALE;
const HANDLE_INNER_SIZE = SIZE_SCALAR * 10;
const LINE_WIDTH = SIZE_SCALAR * 5;
const MARGIN_WIDTH = HANDLE_OUTER_HOVERED_SIZE * 2;
const MARGIN_HEIGHT = HANDLE_OUTER_HOVERED_SIZE * 2;
const GRAPHABLE_VIEWPORT_WIDTH = VIEWPORT_WIDTH - MARGIN_WIDTH * 2;
const GRAPHABLE_VIEWPORT_HEIGHT = VIEWPORT_HEIGHT - MARGIN_HEIGHT * 2;
const ROOT_ATTRS = {
    'viewBox': `0 0 ${VIEWPORT_WIDTH} ${VIEWPORT_HEIGHT}`,
    'xmlns': `${SVG_NS}`,
    'width': '60em',
    'height': '20em',
};
const ROOT_STYLE = `
@media (prefers-color-scheme: dark) {
  svg * {
    --SFG-color-background: #111111;
    --SFG-color-foreground: #ffffff;
  }
}

@media (prefers-color-scheme: light) {
  svg * {
    --SFG-color-background: #ffffff;
    --SFG-color-foreground: #000000;
  }
}

svg * {
  transform-box: fill-box;
}

.sf-graph-handle-inside {
  fill: var(--SFG-color-foreground);
}

.sf-graph-handle-outside {
  stroke: var(--SFG-color-foreground);
}

.sf-graph-handle-outside {
  scale: 1;
  transition: scale 0.1s;
  transform-origin: center;
}

.sf-graph-handle-outside:hover {
  scale: ${HANDLE_OUTER_HOVER_SCALE};
}

.sf-graph-line {
  stroke: var(--SFG-color-foreground);
}

.sf-graph {
  filter: drop-shadow(0 0 ${10 * SIZE_SCALAR}px var(--SFG-color-foreground));
}
`;
const HANDLE_INSIDE_ATTRS = {
    'class': 'sf-graph-handle-inside',
    'r': `${HANDLE_INNER_SIZE}`,
    'fill': 'black',
    'cx': '0',
    'cy': '0',
};
const HANDLE_OUTSIDE_ATTRS = {
    'class': 'sf-graph-handle-outside',
    'r': `${HANDLE_OUTER_SIZE}`,
    'fill-opacity': '0',
    'stroke-width': `${LINE_WIDTH}`,
    'cx': '0',
    'cy': '0',
};
const LINE_ATTRS = {
    'class': 'sf-graph-line',
    'stroke-width': `${LINE_WIDTH}`,
    'fill': 'none',
};
function setSVGAttributes(element, attributes) {
    for (const [k, v] of Object.entries(attributes)) {
        element.setAttribute(k, v);
    }
}
function createSVGElement(element, attributes) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', element);
    setSVGAttributes(svg, attributes);
    return svg;
}
function handleZero() {
    const g = createSVGElement('g', { 'class': 'sf-graph-handle' });
    const inside = createSVGElement('circle', HANDLE_INSIDE_ATTRS);
    const outside = createSVGElement('circle', HANDLE_OUTSIDE_ATTRS);
    g.appendChild(inside);
    g.appendChild(outside);
    return {
        g,
        inside,
        outside,
    };
}
function setHandleLocation(handle, x, y) {
    const attrs = { 'cx': x.toString(), 'cy': y.toString() };
    setSVGAttributes(handle.inside, attrs);
    setSVGAttributes(handle.outside, attrs);
}
function addHandle(g, x, y) {
    const result = handleZero();
    setHandleLocation(result, x, y);
    g.appendChild(result.g);
    g.appendChild(result.g);
    return result;
}
function createLine(g) {
    const result = createSVGElement('polyline', LINE_ATTRS);
    ;
    g.appendChild(result);
    return result;
}
function fitLineToHandles(line, handles) {
    const points = handles.map(h => {
        const x = h.inside.getAttribute('cx');
        const y = h.inside.getAttribute('cy');
        return `${x}, ${y}`;
    }).join(' ');
    setSVGAttributes(line, { 'points': points });
}
function syncToSnowflakeID(g, id) {
    while (g.handles.length < id.length) {
        g.handles.push(addHandle(g.g, 0, 0));
    }
    while (g.handles.length > id.length) {
        const h = g.handles.pop();
        if (h !== undefined) {
            h.g.remove();
        }
        else {
            throw new Error('h undefined');
        }
    }
    g.handles.forEach((h, i) => {
        const x0 = MARGIN_WIDTH;
        const y0 = MARGIN_HEIGHT;
        const dx = GRAPHABLE_VIEWPORT_WIDTH / (id.length - 1);
        const dy = GRAPHABLE_VIEWPORT_HEIGHT / (Constants_yChoices.length - 1);
        const x = x0 + dx * i;
        const y = y0 + dy * id[i];
        setSVGAttributes(h.inside, { 'cx': x.toString(), 'cy': y.toString() });
        setSVGAttributes(h.outside, { 'cx': x.toString(), 'cy': y.toString() });
    });
    fitLineToHandles(g.line, g.handles);
}
function SnowflakeGraph_zero() {
    const root = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const style = document.createElement('style');
    style.textContent = ROOT_STYLE;
    root.appendChild(style);
    const g = createSVGElement('g', { 'class': 'sf-graph' });
    const result = {
        root,
        g,
        handles: [],
        line: createLine(g),
    };
    result.root.appendChild(result.g);
    setSVGAttributes(result.root, ROOT_ATTRS);
    result.handles = [
        addHandle(g, 100, 100),
        addHandle(g, 200, 200),
        addHandle(g, 300, 300),
        addHandle(g, 400, 100),
        addHandle(g, 500, 300),
    ];
    fitLineToHandles(result.line, result.handles);
    syncToSnowflakeID(result, expect(ok(parseSnowflakeID("1993245298354729")), 'unable to parse snowflake id'));
    return result;
}

;// ./src/SnowflakeGraphElement.ts
var __classPrivateFieldSet = (undefined && undefined.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _SnowflakeGraphElement_shadow, _SnowflakeGraphElement_snowflakeID, _SnowflakeGraphElement_graph;





class SnowflakeGraphElement extends HTMLElement {
    constructor() {
        super();
        _SnowflakeGraphElement_shadow.set(this, void 0);
        _SnowflakeGraphElement_snowflakeID.set(this, void 0);
        _SnowflakeGraphElement_graph.set(this, void 0);
        __classPrivateFieldSet(this, _SnowflakeGraphElement_shadow, this.attachShadow({ mode: 'open' }), "f");
        __classPrivateFieldSet(this, _SnowflakeGraphElement_snowflakeID, [4, 4], "f");
        __classPrivateFieldSet(this, _SnowflakeGraphElement_graph, Maybe_none(), "f");
    }
    connectedCallback() {
        const g = SnowflakeGraph_zero();
        __classPrivateFieldSet(this, _SnowflakeGraphElement_graph, some(g), "f");
        __classPrivateFieldGet(this, _SnowflakeGraphElement_shadow, "f").appendChild(g.root);
    }
    disconnectedCallback() {
        console.log('sfg disconnectedCallback');
    }
    adoptedCallback() {
        console.log('sfg adoptedCallback');
    }
    setSnowflakeID(unparsedID) {
        __classPrivateFieldSet(this, _SnowflakeGraphElement_snowflakeID, expect(ok(parseSnowflakeID(unparsedID)), 'invalid snowflake id'), "f");
        Maybe_mapSome(__classPrivateFieldGet(this, _SnowflakeGraphElement_graph, "f"), g => syncToSnowflakeID(g, __classPrivateFieldGet(this, _SnowflakeGraphElement_snowflakeID, "f")));
    }
}
_SnowflakeGraphElement_shadow = new WeakMap(), _SnowflakeGraphElement_snowflakeID = new WeakMap(), _SnowflakeGraphElement_graph = new WeakMap();
/* harmony default export */ const src_SnowflakeGraphElement = (SnowflakeGraphElement);

snowflake_graph = __webpack_exports__;
/******/ })()
;