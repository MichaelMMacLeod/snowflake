import { Direction } from "../snowflake/Direction.js";
export type Point = {
    x: number;
    y: number;
};
export declare const zero: () => Point;
export declare const zeroM: (result: Point) => void;
export declare const midpointTN: (n1: number, n2: number, percent: number) => number;
export declare const rotateX: (x: number, y: number, direction: Direction) => number;
export declare const rotateY: (x: number, y: number, direction: Direction) => number;
