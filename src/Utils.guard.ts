/*
 * Generated type guards for "Utils.ts".
 * WARNING: Do not manually change this file.
 */
import { RGBA } from "./Utils";

export function isRGBA(obj: unknown): obj is RGBA {
    const typedObj = obj as RGBA
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typeof typedObj["r"] === "number" &&
        typeof typedObj["g"] === "number" &&
        typeof typedObj["b"] === "number" &&
        typeof typedObj["a"] === "number"
    )
}
