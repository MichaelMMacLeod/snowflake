import { RGBA } from "./color/Color";
import { ColorScheme } from "./color/Scheme";
import { ColorTheme } from "./color/Theme";
import * as Eithers from "./Either";
import { Either, left, right } from "./Either";
import { Maybe, none, some } from "./Maybe";
import * as Maybes from "./Maybe";
import { NonEmptyArray, okOrElse, randomIntInclusive, SnowflakeID } from "./Utils";

export function isBoolean(value: any): value is boolean {
    return typeof value === 'boolean';
}

export function isFunction(value: any): boolean {
    return typeof value === 'function';
}

export function isNumber(value: any): value is number {
    return typeof value === 'number';
}

export function isFunctionN(value: any, argCount: number): boolean {
    return isFunction(value) && value.length === argCount;
}

export function isFunction0(value: any): value is () => any {
    return isFunctionN(value, 0);
}

export function isFunction1(value: any): value is (a: any) => any {
    return isFunctionN(value, 1);
}

export function parseRGBComponent(value: any): Either<string, number> {
    if (Number.isInteger(value) && value >= 0 && value <= 255) {
        return right(value);
    }
    return left('an integer in the range [0, 255]');
}

export function parseAlphaComponent(value: any): Either<string, number> {
    if (isNumber(value) && value >= 0 && value <= 1) {
        return right(value);
    }
    return left('a float in the range [0, 1]')
}

type Parser<T> = (value: any) => Either<string, T>

type ObjectTemplate<R> = { [K in keyof R]: Parser<R[K]> }

function makeObjectParser<R>(template: ObjectTemplate<R>): (value: any) => Either<string, R> {
    return value => {
        const result = {};
        for (const [k, _] of Object.entries(template)) {
            if (value[k] === undefined) {
                return left(`'object containing key '${k}'`)
            }
        }
        for (const [k, v] of Object.entries(value)) {
            const valueParser = (template as any)[k];
            if (valueParser === undefined) {
                return left(`object not containing key '${k}'`);
            }
            const value = valueParser(v);
            const maybeError = Eithers.map(
                value,
                e => some(`object with key '${k}' holding ${e}`),
                v => {
                    (result as any)[k] = v;
                    return none();
                }
            );
            if (Maybes.isSome(maybeError)) {
                return left(Maybes.unwrapOr(maybeError, () => 'unreachable'));
            }
        }
        return right(result as any);
    };
}

export const parseRGBA: Parser<RGBA> =
    makeObjectParser({
        r: parseRGBComponent,
        g: parseRGBComponent,
        b: parseRGBComponent,
        a: parseAlphaComponent,
    });

export const parseColorScheme: Parser<ColorScheme> =
    makeObjectParser({
        background: parseRGBA,
        foreground: parseRGBA,
    });

export const parseColorTheme: Parser<ColorTheme> =
    makeObjectParser({
        light: parseColorScheme,
        dark: parseColorScheme,
    });

export function parseSnowflakeID(value: any): Either<string, NonEmptyArray<number>> {
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
    return right(result as NonEmptyArray<number>);
}

export function parseNat(value: any): Either<string, number> {
    if (!Number.isSafeInteger(value)) {
        return left('integer');
    }
    if (value < 0) {
        return left('nonnegative integer');
    }
    return right(value);
}

export function parseNonnegativeFloat(value: any): Either<string, number> {
    if (!Number.isFinite(value)) {
        return left('finite, non-NaN float');
    }
    if (value < 0) {
        return left('non-negative float');
    }
    return right(value);
}

export function parsePositiveFloat(value: any): Either<string, number> {
    if (!Number.isFinite(value)) {
        return left('finite, non-NaN float');
    }
    if (value <= 0) {
        return left('positive float');
    }
    return right(value);
}

export function maybemap2<T, U>(
    m: Maybe<T>,
    onNone: () => U,
    onSome: (value: T) => U
): U {
    switch (m.v) {
        case 0:
            return onNone();
        case 1:
            return onSome(m.d);
    }
}

export function okOrElse2<T, E>(m: Maybe<T>, onNone: () => E): Either<E, T> {
    return maybemap2(
        m,
        () => left(onNone()),
        v => right(v),
    );
}

// export function none2<T>(): Maybe<T> {
//     return { v: 0 };
// }

export function then2<T>(b: boolean, onTrue: () => T): Maybe<T> {
    if (b) {
        return { v: 1, d: onTrue() };
    }
    // return { v: 0 };
    return none();
}

function makeParser<T>(predicate: (value: any) => value is T, expected: string): (value: any) => Either<string, T> {
    // return v => okOrElse(Maybes.then(predicate(v), () => v), () => expected);
    return v => okOrElse2(then2(predicate(v), () => v), () => expected);
}

export const parseBool = makeParser(isBoolean, 'boolean');
export const parseFunction0 = makeParser(isFunction0, 'function requiring no arguments');
export const parseFunction1 = makeParser(isFunction1, 'function requiring one argument');

export type ParserFailure = { expected: string, actual: any };

export function isObject(value: any): value is Object {
    return typeof value === 'object' && !Array.isArray(value) && value !== null;
}


export type ConfigParser<UnparsedConfig, Config> = {
    [K in keyof UnparsedConfig]: (value: any) => K extends keyof Config ? Either<string, Config[K]> : never
}

export function parseConfig<UnparsedConfig, Config>(
    u: UnparsedConfig,
    configParser: ConfigParser<UnparsedConfig, Config>,
): Either<Array<ParserFailure>, Config> {
    const errors: Array<ParserFailure> = [];
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
        const kParser = parser[k as keyof UnparsedConfig];
        if (kParser === undefined) {
            errors.push({ expected: `object without key '${k}'`, actual: u });
        } else {
            const r = kParser(v);
            Eithers.map(
                r as any,
                expectedType => errors.push({ expected: `${k} to be ${expectedType}`, actual: v }),
                parsed => (result as any)[k] = parsed,
            );
        }
    }
    if (errors.length > 0) {
        return left(errors);
    }
    return right(result as Config);
}

export function parseErrorString(e: ParserFailure): string {
    return `expected ${e.expected}, received ${e.actual}`;
}

export function parseErrorsString(e: Array<ParserFailure>): string {
    return 'errors detected when validating config\n' + e.map(parseErrorString).join('\n');
}

export function parseConfigAndDisplayErrors<UnparsedConfig, Config>(
    configParser: ConfigParser<UnparsedConfig, Config>,
    u: UnparsedConfig,
): Config {
    return Eithers.map(
        parseConfig(u, configParser),
        errors => { throw new Error(parseErrorsString(errors)) },
        config => config,
    );
}

export function snowflakeIDString(id: NonEmptyArray<number>): SnowflakeID {
    return id.map(n => n + 1).join('') as SnowflakeID;
}

export function randomSnowflakeId(): NonEmptyArray<number> {
    const id: NonEmptyArray<number> = [randomIntInclusive(0, 3)];
    for (let i = 1; i < 16; i++) {
        id.push(randomIntInclusive(0, 8));
    }
    return Eithers.map(
        parseSnowflakeID(snowflakeIDString(id)),
        _err => { throw new Error(`randomSnowflakeId returned invalid ID: '${id}'`) },
        _id => id
    );
}

export function randomSnowflakeIDString(): SnowflakeID {
    return snowflakeIDString(randomSnowflakeId());
}

export type ConfigSynchronizer<State, Config> = {
    [K in keyof Config]: (c: Config, s: State, newValue: Config[K], oldValue: Maybe<Config[K]>) => boolean
};

export function sync<Config extends Object, State>(
    configSynchronizer: ConfigSynchronizer<State, Config>,
    state: State,
    resetState: () => void,
    oldConfig: Maybe<Config>,
    newConfig: Config,
): void {
    const cs: any = configSynchronizer;
    let needsReset = false;
    for (let [k, v] of Object.entries(newConfig)) {
        const oldValue = Maybes.mapSome(oldConfig, old => (old as any)[k]);
        needsReset = cs[k](newConfig, state, v, oldValue) || needsReset;
    }
    if (needsReset) {
        resetState();
    }
}