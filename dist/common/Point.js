import * as Directions from "../snowflake/Direction.js";
export function zero() {
    return { x: 0, y: 0 };
}
;
export function zeroM(result) {
    result.x = 0;
    result.y = 0;
}
export function make(x, y) {
    return { x, y };
}
export function copy(p) {
    return { x: p.x, y: p.y };
}
export function add(p1, p2) {
    return { x: p1.x + p2.x, y: p1.y + p2.y };
}
export function negate(p) {
    return { x: -p.x, y: -p.y };
}
export function subtract(p1, p2) {
    return add(p1, negate(p2));
}
export function midpoint(p1, p2) {
    return {
        x: p1.x + 0.5 * (p2.x - p1.x),
        y: p1.y + 0.5 * (p2.y - p1.y)
    };
}
/** Returns the point that is `percent` between `p1` and `p2`. `percent`
 * should be `>= 0` and `<= 1`.
 */
export function midpointT(p1, p2, percent) {
    return add(scale(p1, 1 - percent), scale(p2, percent));
}
export function midpointTN(n1, n2, percent) {
    return n1 * (1 - percent) + n2 * percent;
}
export function scale(p, scalar) {
    return { x: scalar * p.x, y: scalar * p.y };
}
export function translate(p, direction, distance) {
    return {
        x: p.x + distance * Math.cos(Directions.values[direction]),
        y: p.y + distance * Math.sin(Directions.values[direction]),
    };
}
// Rotates 'point' by 'theta' around (0,0) counterclockwise.
export function rotate(point, theta) {
    return {
        x: point.x * Math.cos(theta) - point.y * Math.sin(theta),
        y: point.x * Math.sin(theta) + point.y * Math.cos(theta),
    };
}
export function rotateX(x, y, direction) {
    return x * Directions.cosines[direction] - y * Directions.sines[direction];
}
export function rotateY(x, y, direction) {
    return x * Directions.sines[direction] + y * Directions.cosines[direction];
}
export function distance(p1, p2) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
}
export function ofMouseEvent(ev) {
    return {
        x: ev.x,
        y: ev.y,
    };
}
//# sourceMappingURL=Point.js.map