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
declare const _face_center_xs = 0;
declare const _face_center_ys = 1;
declare const _face_sizes = 2;
declare const _face_growth_scales = 3;
declare const _branch_start_xs = 4;
declare const _branch_start_ys = 5;
declare const _branch_sizes = 6;
declare const _branch_lengths = 7;
declare const _branch_growth_scales = 8;
declare const _face_directions = 9;
declare const _face_growings = 10;
declare const _branch_directions = 11;
declare const _branch_growings = 12;
declare const _numFaces = 13;
declare const _numBranches = 14;
declare const _sideCaches = 15;
declare const _numInitialGrownFaces = 16;
declare const _numInitialGrownBranches = 17;
export type Snowflake = {
    [_face_center_xs]: Float32Array;
    [_face_center_ys]: Float32Array;
    [_face_sizes]: Float32Array;
    [_face_growth_scales]: Float32Array;
    [_branch_start_xs]: Float32Array;
    [_branch_start_ys]: Float32Array;
    [_branch_sizes]: Float32Array;
    [_branch_lengths]: Float32Array;
    [_branch_growth_scales]: Float32Array;
    [_face_directions]: Uint8Array;
    [_face_growings]: Uint8Array;
    [_branch_directions]: Uint8Array;
    [_branch_growings]: Uint8Array;
    [_numFaces]: number;
    [_numBranches]: number;
    [_sideCaches]: SideCache;
    [_numInitialGrownFaces]: number;
    [_numInitialGrownBranches]: number;
};
export declare const addFaceM: (snowflake: Snowflake, centerX: number, centerY: number, size: number, direction: Direction, growthScale: number, growing: boolean) => boolean;
export declare const addBranchM: (snowflake: Snowflake, startX: number, startY: number, size: number, length: number, direction: Direction, growthScale: number, growing: boolean) => boolean;
export declare const forEachGrowingFace: (snowflake: Snowflake, f: (index: number) => void) => void;
export declare const forEachGrowingBranch: (snowflake: Snowflake, f: (index: number) => void) => void;
export declare const draw: (g: Graphic, snowflake: Snowflake, foregroundColor: string) => boolean;
export declare const zero: () => Snowflake;
export declare const zeroM: (s: Snowflake) => void;
export declare const addBranchesToGrowingFaces: (snowflake: Snowflake) => void;
export declare const addFacesToGrowingBranches: (snowflake: Snowflake) => void;
export declare const enlargeGrowingFaces: (snowflake: Snowflake, scale: number) => void;
export declare const enlargeGrowingBranches: (snowflake: Snowflake) => void;
export declare const cacheNormalizedSides: (snowflake: Snowflake) => void;
export declare const killPartIfCoveredInOneDirection: (partIndex: number, sideLeftCache: SideCacheArray, sideRightCache: SideCacheArray, sideHeightCache: SideCacheArray, otherLeftSideCache: SideCacheArray, otherRightSideCache: SideCacheArray, otherHeightSideCache: SideCacheArray, numOtherSides: number, otherCacheContainsPart: boolean, growings: Uint8Array) => void;
export declare const killPartIfCoveredInOneOfTwoDirections: (caches: SideCache, numFaces: number, numBranches: number, left: Direction, right: Direction, partIndex: number, partIsFace: boolean, growings: Uint8Array) => void;
export declare const killPartIfCovered: (partIndex: number, caches: SideCache, numFaces: number, numBranches: number, partIsFace: boolean, directions: Uint8Array, growings: Uint8Array) => void;
export declare const killCoveredFaces: (snowflake: Snowflake) => void;
export declare const killCoveredBranches: (snowflake: Snowflake) => void;
export {};
