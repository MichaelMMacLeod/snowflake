import { black, white } from "./Color.js";
import * as Color from "./Color.js";
export function equals(cs1, cs2) {
    return Color.equals(cs1.background, cs2.background)
        && Color.equals(cs1.foreground, cs2.foreground);
}
export function zeroLight() {
    return { background: white(), foreground: black() };
}
export function zeroDark() {
    return { background: black(), foreground: white() };
}
//# sourceMappingURL=Scheme.js.map