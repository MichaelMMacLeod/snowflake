import { Array6, SideCacheArray } from "../common/Utils.js";
import { Direction } from "./Direction.js";
export declare const normalizeSide2DFaceM: (resultLeft: SideCacheArray, resultRight: SideCacheArray, resultHeight: SideCacheArray, partIndex: number, centerX: number, centerY: number, size: number, absoluteDirection: number) => void;
export declare const normalizeSide2DBranchM: (resultLeft: SideCacheArray, resultRight: SideCacheArray, resultHeight: SideCacheArray, partIndex: number, startX: number, startY: number, length: number, branchDirection: Direction, size: number, absoluteDirection: number) => void;
export declare const normalizeFaceRelativeSide2DsM: (resultLeft: Array6<SideCacheArray>, resultRight: Array6<SideCacheArray>, resultHeight: Array6<SideCacheArray>, partIndex: number, centerX: number, centerY: number, size: number) => void;
export declare const normalizeBranchRelativeSide2DsM: (resultLeft: Array6<SideCacheArray>, resultRight: Array6<SideCacheArray>, resultHeight: Array6<SideCacheArray>, partIndex: number, startX: number, startY: number, length: number, branchDirection: Direction, size: number) => void;
export declare const overlapDistance: (height1: number, height2: number) => number;
export declare const overlaps: (l1: number, r1: number, l2: number, r2: number) => boolean;
