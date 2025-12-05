import * as Schemes from "./Scheme.js";
export function equals(ct1, ct2) {
    return Schemes.equals(ct1.dark, ct2.dark)
        && Schemes.equals(ct1.light, ct2.light);
}
export function zero() {
    return { dark: Schemes.zeroDark(), light: Schemes.zeroLight() };
}
//# sourceMappingURL=Theme.js.map