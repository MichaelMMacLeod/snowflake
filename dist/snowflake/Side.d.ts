import { Face } from "./Face.js";
import { Array6, SideCacheArray } from "../common/Utils.js";
import { Branch } from "./Branch.js";
export declare const normalizeSide2DFaceM: (resultLeft: SideCacheArray, resultRight: SideCacheArray, resultHeight: SideCacheArray, partIndex: number, face: Face, absoluteDirection: number) => void;
export declare const normalizeSide2DBranchM: (resultLeft: SideCacheArray, resultRight: SideCacheArray, resultHeight: SideCacheArray, partIndex: number, branch: Branch, absoluteDirection: number) => void;
export declare const normalizeFaceRelativeSide2DsM: (resultLeft: Array6<SideCacheArray>, resultRight: Array6<SideCacheArray>, resultHeight: Array6<SideCacheArray>, partIndex: number, face: Face) => void;
export declare const normalizeBranchRelativeSide2DsM: (resultLeft: Array6<SideCacheArray>, resultRight: Array6<SideCacheArray>, resultHeight: Array6<SideCacheArray>, partIndex: number, branch: Branch) => void;
export declare const overlapDistance: (height1: number, height2: number) => number;
export declare const overlaps: (l1: number, r1: number, l2: number, r2: number) => boolean;
