import { Point } from "../common/Point.js";
import { Direction } from "./Direction.js";
import { Graphic } from "./Graphic.js";
export type Face = {
    center: Point;
    size: number;
    isFirstFace: boolean;
    direction: Direction;
    growthScale: number;
    growing: boolean;
};
export declare const pointNX: (centerX: number, size: number, absoluteDirection: number) => number;
export declare const pointNY: (centerY: number, size: number, absoluteDirection: number) => number;
export declare const setPointN: (result: Point, face: Face, i: number) => void;
export declare const setPointNManually: (result: Point, direction: Direction, center: Point, size: number, i: number) => void;
export declare const draw: (g: Graphic, centerX: number, centerY: number, size: number, d: Direction, isFirstFace: boolean) => boolean;
