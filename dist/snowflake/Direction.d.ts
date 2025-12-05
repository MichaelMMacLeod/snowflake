import { Array6 } from "../common/Utils.js";
export type Direction = 0 | 1 | 2 | 3 | 4 | 5;
export declare const DIRS: 6;
export declare const values: Array6<number>;
export declare const cosines: Array6<number>;
export declare const sines: Array6<number>;
export declare const next: (d: Direction) => Direction;
export declare const previou: (d: Direction) => Direction;
