import { ColorScheme } from "./Scheme.js";
export type ColorTheme = {
    dark: ColorScheme;
    light: ColorScheme;
};
export declare function equals(ct1: ColorTheme, ct2: ColorTheme): boolean;
export declare function zero(): ColorTheme;
