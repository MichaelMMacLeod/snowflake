import { ColorScheme } from "./Scheme.js";
export type ColorTheme = {
    dark: ColorScheme;
    light: ColorScheme;
};
export declare const equals: (ct1: ColorTheme, ct2: ColorTheme) => boolean;
export declare const zero: () => ColorTheme;
