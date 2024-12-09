/*
 * Generated type guards for "State.ts".
 * WARNING: Do not manually change this file.
 */
import { isRGBA } from "./Utils.guard";
import { StateOptions } from "./State";

export function isStateOptions(obj: unknown): obj is StateOptions {
    const typedObj = obj as StateOptions
    return (
        (typedObj !== null &&
            typeof typedObj === "object" ||
            typeof typedObj === "function") &&
        typedObj["snowflakeInstallationElement"] instanceof HTMLElement &&
        (typeof typedObj["controlsInstallationElement"] === "undefined" ||
            typedObj["controlsInstallationElement"] instanceof HTMLElement) &&
        (typedObj["graphOptions"] !== null &&
            typeof typedObj["graphOptions"] === "object" ||
            typeof typedObj["graphOptions"] === "function") &&
        isRGBA(typedObj["graphOptions"]["progressColor"]) as boolean &&
        isRGBA(typedObj["graphOptions"]["progressLineColor"]) as boolean &&
        isRGBA(typedObj["graphOptions"]["backgroundColor"]) as boolean &&
        isRGBA(typedObj["graphOptions"]["foregroundColor"]) as boolean
    )
}
