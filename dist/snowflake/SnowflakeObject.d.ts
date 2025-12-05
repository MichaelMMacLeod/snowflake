import { Face } from "./Face.js";
import { Branch } from "./Branch.js";
import { Graphic } from "./Graphic.js";
import { Direction } from "./Direction.js";
import { Array6, SideCacheArray } from "../common/Utils.js";
type SideCache = [
    Array6<SideCacheArray>,
    Array6<SideCacheArray>,
    Array6<SideCacheArray>,
    Array6<SideCacheArray>,
    Array6<SideCacheArray>,
    Array6<SideCacheArray>
];
declare const _faces = 0;
declare const _branches = 1;
declare const _numFaces = 2;
declare const _numBranches = 3;
declare const _sideCaches = 4;
declare const _numInitialGrownFaces = 5;
declare const _numInitialGrownBranches = 6;
export type Snowflake = {
    [_faces]: Array<Face>;
    [_branches]: Array<Branch>;
    [_numFaces]: number;
    [_numBranches]: number;
    [_sideCaches]: SideCache;
    [_numInitialGrownFaces]: number;
    [_numInitialGrownBranches]: number;
};
export declare const addFaceM: (snowflake: Snowflake, centerX: number, centerY: number, size: number, isFirstFace: boolean, direction: Direction, growthScale: number, growing: boolean) => boolean;
export declare const addBranchM: (snowflake: Snowflake, startX: number, startY: number, size: number, length: number, direction: Direction, growthScale: number, growing: boolean) => boolean;
export declare const forEachFace: (snowflake: Snowflake, f: (face: Face, index: number) => void) => void;
export declare const forEachBranch: (snowflake: Snowflake, f: (branch: Branch, index: number) => void) => void;
export declare const forEachGrowingFace: (snowflake: Snowflake, f: (face: Face, index: number) => void) => void;
export declare const forEachGrowingBranch: (snowflake: Snowflake, f: (branch: Branch, index: number) => void) => void;
export declare const draw: (g: Graphic, snowflake: Snowflake, foregroundColor: string) => boolean;
export declare const zero: () => Snowflake;
export declare const zeroM: (s: Snowflake) => void;
export declare const addBranchesToGrowingFaces: (snowflake: Snowflake) => void;
export declare const addFacesToGrowingBranches: (snowflake: Snowflake) => void;
export declare const cacheNormalizedSides: (snowflake: Snowflake) => void;
type Killable = {
    direction: Direction;
    growing: boolean;
};
export declare const killPartIfCoveredInOneDirection: (part: Killable, partIndex: number, sideLeftCache: SideCacheArray, sideRightCache: SideCacheArray, sideHeightCache: SideCacheArray, otherLeftSideCache: SideCacheArray, otherRightSideCache: SideCacheArray, otherHeightSideCache: SideCacheArray, numOtherSides: number, otherCacheContainsPart: boolean) => void;
export declare const killPartIfCoveredInOneOfTwoDirections: (caches: SideCache, numFaces: number, numBranches: number, left: Direction, right: Direction, part: Killable, partIndex: number, partIsFace: boolean) => void;
export declare const killPartIfCovered: (part: Killable, partIndex: number, caches: SideCache, numFaces: number, numBranches: number, partIsFace: boolean) => void;
export declare const killCoveredFaces: (snowflake: Snowflake) => void;
export declare const killCoveredBranches: (snowflake: Snowflake) => void;
export {};
