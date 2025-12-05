import { yChoices } from "./Constants.js";
export function rem(x, m) {
    return ((x % m) + m) % m;
}
export function clamp(x, low, high) {
    return Math.min(Math.max(x, low), high);
}
export function lerp(a, b, n) {
    return (1 - n) * a + n * b;
}
export function fracPart(n) {
    return n % 1;
}
export function makeArray6(f) {
    return [f(), f(), f(), f(), f(), f()];
}
export function mapArray6(array, callbackfn, thisArg) {
    return array.map(callbackfn, thisArg);
}
export function randomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
export const sideCacheConstructor = length => new Float64Array(length);
export function interpretGrowth(growthInput, time) {
    let s = lerp(0, growthInput.length - 1, time);
    let n = fracPart(s);
    let a = yChoices[growthInput[Math.floor(s)]];
    let b = yChoices[growthInput[Math.ceil(s)]];
    let signedScale = lerp(a, b, n);
    // let timeScalar = -0.01 * s + 1;
    return {
        scale: /*timeScalar **/ Math.abs(signedScale),
        growthType: signedScale > 0.0 ? 'branching' : 'faceting',
    };
}
export function arraysEqual(a1, a2, eqT) {
    return a1.length === a2.length
        && a1.every((v, i) => eqT(v, a2[i]));
}
//# sourceMappingURL=Utils.js.map