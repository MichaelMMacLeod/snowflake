import * as Eithers from "maybe-either/Either";
import { left, right } from "maybe-either/Either";
import { none, okOrElse, some } from "maybe-either/Maybe";
import * as Maybes from "maybe-either/Maybe";
import { randomIntInclusive } from "./Utils.js";
import { thenDo } from "maybe-either/Boolean";
export const isBoolean = (value) => {
    return typeof value === 'boolean';
};
export const isFunction = (value) => {
    return typeof value === 'function';
};
export const isNumber = (value) => {
    return typeof value === 'number';
};
export const isFunctionN = (value, argCount) => {
    return isFunction(value) && value.length === argCount;
};
export const isFunction0 = (value) => {
    return isFunctionN(value, 0);
};
export const isFunction1 = (value) => {
    return isFunctionN(value, 1);
};
export const parseRGBComponent = (value) => {
    if (Number.isInteger(value) && value >= 0 && value <= 255) {
        return right(value);
    }
    return left('an integer in the range [0, 255]');
};
export const parseAlphaComponent = (value) => {
    if (isNumber(value) && value >= 0 && value <= 1) {
        return right(value);
    }
    return left('a float in the range [0, 1]');
};
const makeObjectParser = (template) => {
    return value => {
        const result = {};
        for (const [k, _] of Object.entries(template)) {
            if (value[k] === undefined) {
                return left(`'object containing key '${k}'`);
            }
        }
        for (const [k, v] of Object.entries(value)) {
            const valueParser = template[k];
            if (valueParser === undefined) {
                return left(`object not containing key '${k}'`);
            }
            const value = valueParser(v);
            const maybeError = Eithers.map(value, e => some(`object with key '${k}' holding ${e}`), (v) => {
                result[k] = v;
                return none;
            });
            if (Maybes.isSome(maybeError)) {
                return left(Maybes.unwrapOr(maybeError, () => 'unreachable'));
            }
        }
        return right(result);
    };
};
export const parseRGBA = makeObjectParser({
    r: parseRGBComponent,
    g: parseRGBComponent,
    b: parseRGBComponent,
    a: parseAlphaComponent,
});
export const parseColorScheme = makeObjectParser({
    background: parseRGBA,
    foreground: parseRGBA,
});
export const parseColorTheme = makeObjectParser({
    light: parseColorScheme,
    dark: parseColorScheme,
});
export const parseSnowflakeID = (value) => {
    if (value.toString === undefined) {
        return left('integer or string containing digits [1-9]');
    }
    const digits = value.toString();
    const result = [];
    for (let i = 0; i < digits.length; ++i) {
        const digit = parseInt(digits[i], 10);
        if (Number.isNaN(digit)) {
            return left('integer or string containing digits [1-9]');
        }
        if (digit === 0) {
            return left('integer or string containing digits [1-9]');
        }
        const parsedDigit = digit - 1;
        result.push(parsedDigit);
    }
    if (result.length < 2) {
        return left('integer or string containing at least two nonzero digits');
    }
    return right(result);
};
export const parseNat = (value) => {
    if (!Number.isSafeInteger(value)) {
        return left('integer');
    }
    if (value < 0) {
        return left('nonnegative integer');
    }
    return right(value);
};
export const parseNonnegativeFloat = (value) => {
    if (!Number.isFinite(value)) {
        return left('finite, non-NaN float');
    }
    if (value < 0) {
        return left('non-negative float');
    }
    return right(value);
};
export const parsePositiveFloat = (value) => {
    if (!Number.isFinite(value)) {
        return left('finite, non-NaN float');
    }
    if (value <= 0) {
        return left('positive float');
    }
    return right(value);
};
const makeParser = (predicate, expected) => {
    // return v => okOrElse(Maybes.then(predicate(v), () => v), () => expected);
    return v => okOrElse(thenDo(predicate(v), () => v), () => expected);
};
export const parseBool = makeParser(isBoolean, 'boolean');
export const parseFunction0 = makeParser(isFunction0, 'function requiring no arguments');
export const parseFunction1 = makeParser(isFunction1, 'function requiring one argument');
export const isObject = (value) => {
    return typeof value === 'object' && !Array.isArray(value) && value !== null;
};
export const parseConfig = (u, configParser) => {
    const errors = [];
    const parser = configParser;
    const result = {};
    if (!isObject(u)) {
        errors.push({ expected: 'object', actual: JSON.stringify(u) });
        return left(errors);
    }
    if (errors.length > 0) {
        return left(errors);
    }
    for (const [k, v] of Object.entries(u)) {
        const kParser = parser[k];
        if (kParser === undefined) {
            errors.push({ expected: `object without key '${k}'`, actual: u });
        }
        else {
            const r = kParser(v);
            Eithers.map(r, expectedType => errors.push({ expected: `${k} to be ${expectedType}`, actual: v }), parsed => result[k] = parsed);
        }
    }
    if (errors.length > 0) {
        return left(errors);
    }
    return right(result);
};
export const parseErrorString = (e) => {
    return `expected ${e.expected}, received ${e.actual}`;
};
export const parseErrorsString = (e) => {
    return 'errors detected when validating config\n' + e.map(parseErrorString).join('\n');
};
export const parseConfigAndDisplayErrors = (configParser, u) => {
    return Eithers.map(parseConfig(u, configParser), errors => { throw new Error(parseErrorsString(errors)); }, config => config);
};
export const snowflakeIDString = (id) => {
    return id.map(n => n + 1).join('');
};
export const randomSnowflakeId = () => {
    const id = [randomIntInclusive(0, 3)];
    for (let i = 1; i < 16; i++) {
        id.push(randomIntInclusive(0, 8));
    }
    return Eithers.map(parseSnowflakeID(snowflakeIDString(id)), _err => { throw new Error(`randomSnowflakeId returned invalid ID: '${id}'`); }, _id => id);
};
export const randomSnowflakeIDString = () => {
    return snowflakeIDString(randomSnowflakeId());
};
export const sync = (configSynchronizer, state, resetState, oldConfig, newConfig) => {
    const cs = configSynchronizer;
    let needsReset = false;
    for (let [k, v] of Object.entries(newConfig)) {
        const oldValue = Maybes.mapSome(oldConfig, old => old[k]);
        needsReset = cs[k](newConfig, state, v, oldValue) || needsReset;
    }
    if (needsReset) {
        resetState();
    }
};
//# sourceMappingURL=Config.js.map