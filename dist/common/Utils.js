import { yChoices } from "./Constants.js";
export const rem = (x, m) => {
    return ((x % m) + m) % m;
};
export const clamp = (x, low, high) => {
    return Math.min(Math.max(x, low), high);
};
export const lerp = (a, b, n) => {
    return (1 - n) * a + n * b;
};
export const fracPart = (n) => {
    return n % 1;
};
export const makeArray6 = (f) => {
    return [f(), f(), f(), f(), f(), f()];
};
export const randomIntInclusive = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
};
export const sideCacheConstructor = length => new Float64Array(length);
export const growthTypeBranching = 0;
export const growthTypeFaceting = 1;
export const interpretGrowth = (growthInput, time) => {
    let s = lerp(0, growthInput.length - 1, time);
    let n = fracPart(s);
    let a = yChoices[growthInput[Math.floor(s)]];
    let b = yChoices[growthInput[Math.ceil(s)]];
    let signedScale = lerp(a, b, n);
    // let timeScalar = -0.01 * s + 1;
    return {
        scale: /*timeScalar **/ Math.abs(signedScale),
        growthType: signedScale > 0.0 ? growthTypeBranching : growthTypeFaceting,
    };
};
export const arraysEqual = (a1, a2, eqT) => {
    return a1.length === a2.length
        && a1.every((v, i) => eqT(v, a2[i]));
};
export const doNothing = () => { return; };
//# sourceMappingURL=Utils.js.map