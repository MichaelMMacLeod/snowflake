export type RGBA = {
    r: number,
    g: number,
    b: number,
    a: number,
}

export const equals = (c1: RGBA, c2: RGBA): boolean => {
    return c1.r === c2.r
        && c1.g === c2.g
        && c1.b === c2.b
        && c1.a === c2.a;
}

export const toString = ({ r, g, b, a }: RGBA): string => {
    return `rgba(${r},${g},${b},${a})`;
}

export const black = (): RGBA => {
    return { r: 0, g: 0, b: 0, a: 0.08 };
}

export const white = (): RGBA => {
    return { r: 255, g: 255, b: 255, a: 0.08 };
}