import { RGBA } from "./Color.js";
export type ColorScheme = {
    background: RGBA;
    foreground: RGBA;
};
export declare const equals: (cs1: ColorScheme, cs2: ColorScheme) => boolean;
export declare const zeroLight: () => ColorScheme;
export declare const zeroDark: () => ColorScheme;
