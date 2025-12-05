import { ColorScheme } from "./Scheme.js";
import * as Schemes from "./Scheme.js";

export type ColorTheme = {
    dark: ColorScheme,
    light: ColorScheme,
}

export const equals = (ct1: ColorTheme, ct2: ColorTheme): boolean => {
    return Schemes.equals(ct1.dark, ct2.dark)
        && Schemes.equals(ct1.light, ct2.light);
}

export const zero = (): ColorTheme => {
    return { dark: Schemes.zeroDark(), light: Schemes.zeroLight() };
}