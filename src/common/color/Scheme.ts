import { black, RGBA, white } from "./Color.js";
import * as Color from "./Color.js";

export type ColorScheme = {
    background: RGBA,
    foreground: RGBA,
}

export function equals(cs1: ColorScheme, cs2: ColorScheme): boolean {
    return Color.equals(cs1.background, cs2.background)
        && Color.equals(cs1.foreground, cs2.foreground);
}

export function zeroLight(): ColorScheme {
    return { background: white(), foreground: black() };
}

export function zeroDark(): ColorScheme {
    return { background: black(), foreground: white() };
}
