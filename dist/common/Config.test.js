import { expect, test } from 'vitest';
import { parseColorScheme, parseColorTheme, parseRGBA } from './Config.js';
import { left, right } from 'maybe-either/Either';
const parseRGBACorrectTest = (color) => {
    return () => expect(parseRGBA(color)).toStrictEqual(right(color));
};
test('parseRGBA correct 1', parseRGBACorrectTest({ r: 1, g: 2, b: 3, a: 0.4 }));
test('parseRGBA correct 2', parseRGBACorrectTest({ r: 255, g: 255, b: 255, a: 1 }));
test('parseRGBA correct 3', parseRGBACorrectTest({ r: 0, g: 0, b: 0, a: 0 }));
const badColorComponentTest = (badComponent) => {
    return () => {
        const c = { r: 0, g: 0, b: 0, a: 0 };
        for (const [k, _] of Object.entries(c)) {
            c[k] = badComponent;
            const msg = (() => {
                if (k === 'a') {
                    return `object with key '${k}' holding a float in the range [0, 1]`;
                }
                return `object with key '${k}' holding an integer in the range [0, 255]`;
            })();
            expect(parseRGBA(c)).toStrictEqual(left(msg));
            c[k] = 0;
        }
    };
};
test('parseRGBA out of bounds', badColorComponentTest(256));
test('parseRGBA NaN', badColorComponentTest(NaN));
test('parseRGBA string', badColorComponentTest('0'));
test('parseRGBA false', badColorComponentTest(false));
const parseColorSchemeCorrectTest = (scheme) => {
    return () => expect(parseColorScheme(scheme)).toStrictEqual(right(scheme));
};
test('parseColorScheme correct 1', parseColorSchemeCorrectTest({
    background: { r: 0, g: 0, b: 0, a: 1 },
    foreground: { r: 255, g: 255, b: 255, a: 1 },
}));
const parseColorThemeCorrectTest = (scheme) => {
    return () => expect(parseColorTheme(scheme)).toStrictEqual(right(scheme));
};
const black = { r: 0, g: 0, b: 0, a: 1 };
const white = { r: 255, g: 255, b: 255, a: 1 };
test('parseColorTheme correct 1', parseColorThemeCorrectTest({
    light: {
        foreground: black,
        background: white,
    },
    dark: {
        foreground: white,
        background: black,
    }
}));
//# sourceMappingURL=Config.test.js.map