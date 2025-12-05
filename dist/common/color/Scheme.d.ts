import { RGBA } from "./Color.js";
export type ColorScheme = {
    background: RGBA;
    foreground: RGBA;
};
export declare function equals(cs1: ColorScheme, cs2: ColorScheme): boolean;
export declare function zeroLight(): ColorScheme;
export declare function zeroDark(): ColorScheme;
