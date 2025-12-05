import * as Schemes from "./Scheme.js";
export const equals = (ct1, ct2) => {
    return Schemes.equals(ct1.dark, ct2.dark)
        && Schemes.equals(ct1.light, ct2.light);
};
export const zero = () => {
    return { dark: Schemes.zeroDark(), light: Schemes.zeroLight() };
};
//# sourceMappingURL=Theme.js.map