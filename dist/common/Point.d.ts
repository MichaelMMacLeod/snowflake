import { Direction } from "../snowflake/Direction.js";
export type Point = {
    x: number;
    y: number;
};
export declare function zero(): Point;
export declare function zeroM(result: Point): void;
export declare function make(x: number, y: number): Point;
export declare function copy(p: Point): Point;
export declare function add(p1: Point, p2: Point): Point;
export declare function negate(p: Point): Point;
export declare function subtract(p1: Point, p2: Point): Point;
export declare function midpoint(p1: Point, p2: Point): Point;
/** Returns the point that is `percent` between `p1` and `p2`. `percent`
 * should be `>= 0` and `<= 1`.
 */
export declare function midpointT(p1: Point, p2: Point, percent: number): Point;
export declare function midpointTN(n1: number, n2: number, percent: number): number;
export declare function scale(p: Point, scalar: number): Point;
export declare function translate(p: Point, direction: Direction, distance: number): Point;
export declare function rotate(point: Point, theta: number): Point;
export declare function rotateX(x: number, y: number, direction: Direction): number;
export declare function rotateY(x: number, y: number, direction: Direction): number;
export declare function distance(p1: Point, p2: Point): number;
export declare function ofMouseEvent(ev: MouseEvent): Point;
