import { Point } from "../common/Point.js";
import { Direction } from "./Direction.js";
import { Graphic } from "./Graphic.js";
export type Branch = {
    start: Point;
    size: number;
    length: number;
    direction: Direction;
    growthScale: number;
    growing: boolean;
};
export declare const zero: () => Branch;
export declare const endCenterX: (branch: Branch) => number;
export declare const endCenterY: (branch: Branch) => number;
export declare const pointNX: (branch: Branch, absoluteDirection: number) => number;
export declare const pointNY: (branch: Branch, absoluteDirection: number) => number;
export declare const draw: (graphic: Graphic, branch: Branch) => boolean;
export declare const enlarge: (branch: Branch, scale: number) => void;
