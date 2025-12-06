import { Direction } from "./Direction.js";
import { Graphic } from "./Graphic.js";
export declare const endCenterX: (startX: number, length: number, d: Direction) => number;
export declare const endCenterY: (startY: number, length: number, d: Direction) => number;
export declare const pointNX: (startX: number, length: number, branchDirection: Direction, size: number, absoluteDirection: number) => number;
export declare const pointNY: (startY: number, length: number, branchDirection: Direction, size: number, absoluteDirection: number) => number;
export declare const draw: (g: Graphic, startX: number, startY: number, size: number, length: number, d: Direction) => boolean;
