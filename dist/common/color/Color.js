export function equals(c1, c2) {
    return c1.r === c2.r
        && c1.g === c2.g
        && c1.b === c2.b
        && c1.a === c2.a;
}
export function toString({ r, g, b, a }) {
    return `rgba(${r},${g},${b},${a})`;
}
export function black() {
    return { r: 0, g: 0, b: 0, a: 0.08 };
}
export function white() {
    return { r: 255, g: 255, b: 255, a: 0.08 };
}
//# sourceMappingURL=Color.js.map