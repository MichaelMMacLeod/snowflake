import * as Eithers from "maybe-either/Either";
import { Either, left, right } from "maybe-either/Either";
import { Maybe, none, okOrElse, some } from "maybe-either/Maybe";
import * as Maybes from "maybe-either/Maybe";
import { NonEmptyArray, randomIntInclusive, SnowflakeID } from "./Utils.js";
import { thenDo } from "maybe-either/Boolean";

export const isBoolean = (value: any): value is boolean => {
    return typeof value === 'boolean';
}

export const isFunction = (value: any): boolean => {
    return typeof value === 'function';
}

export const isNumber = (value: any): value is number => {
    return typeof value === 'number';
}

export const isFunctionN = (value: any, argCount: number): boolean => {
    return isFunction(value) && value.length === argCount;
}

export const isFunction0 = (value: any): value is () => any => {
    return isFunctionN(value, 0);
}

export const isFunction1 = (value: any): value is (a: any) => any => {
    return isFunctionN(value, 1);
}

export const parseRGBComponent = (value: any): Either<string, number> => {
    if (Number.isInteger(value) && value >= 0 && value <= 255) {
        return right(value);
    }
    return left('an integer in the range [0, 255]');
}

export const parseAlphaComponent = (value: any): Either<string, number> => {
    if (isNumber(value) && value >= 0 && value <= 1) {
        return right(value);
    }
    return left('a float in the range [0, 1]')
}

type Parser<T> = (value: any) => Either<string, T>

type ObjectTemplate<R> = { [K in keyof R]: Parser<R[K]> }

const makeObjectParser = <R>(template: ObjectTemplate<R>): ((value: any) => Either<string, R>) => {
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
            const maybeError: Maybe<string> = Eithers.map(
                value,
                e => some(`object with key '${k}' holding ${e}`),
                (v): Maybe<string> => {
                    (result as any)[k] = v;
                    return none;
                }
            );
            if (Maybes.isSome(maybeError)) {
                return left(Maybes.unwrapOr(maybeError, () => 'unreachable'));
            }
        }
        return right(result as any);
    };
}

export const parseSnowflakeID = (value: any): Either<string, NonEmptyArray<number>> => {
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

export const parseNat = (value: any): Either<string, number> => {
    if (!Number.isSafeInteger(value)) {
        return left('integer');
    }
    if (value < 0) {
        return left('nonnegative integer');
    }
    return right(value);
}

export const parseNonnegativeFloat = (value: any): Either<string, number> => {
    if (!Number.isFinite(value)) {
        return left('finite, non-NaN float');
    }
    if (value < 0) {
        return left('non-negative float');
    }
    return right(value);
}

export const parsePositiveFloat = (value: any): Either<string, number> => {
    if (!Number.isFinite(value)) {
        return left('finite, non-NaN float');
    }
    if (value <= 0) {
        return left('positive float');
    }
    return right(value);
}

const makeParser = <T>(predicate: (value: any) => value is T, expected: string): (value: any) => Either<string, T> => {
    // return v => okOrElse(Maybes.then(predicate(v), () => v), () => expected);
    return v => okOrElse(thenDo(predicate(v), () => v), () => expected);
}

export const parseBool = makeParser(isBoolean, 'boolean');
export const parseFunction0 = makeParser(isFunction0, 'function requiring no arguments');
export const parseFunction1 = makeParser(isFunction1, 'function requiring one argument');

export type ParserFailure = { expected: string, actual: any };

export const isObject = (value: any): value is Object => {
    return typeof value === 'object' && !Array.isArray(value) && value !== null;
}


export type ConfigParser<UnparsedConfig, Config> = {
    [K in keyof UnparsedConfig]: (value: any) => K extends keyof Config ? Either<string, Config[K]> : never
}

export const parseConfig = <UnparsedConfig, Config>(
    u: UnparsedConfig,
    configParser: ConfigParser<UnparsedConfig, Config>,
): Either<Array<ParserFailure>, Config> => {
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

export const parseErrorString = (e: ParserFailure): string => {
    return `expected ${e.expected}, received ${e.actual}`;
}

export const parseErrorsString = (e: Array<ParserFailure>): string => {
    return 'errors detected when validating config\n' + e.map(parseErrorString).join('\n');
}

export const parseConfigAndDisplayErrors = <UnparsedConfig, Config>(
    configParser: ConfigParser<UnparsedConfig, Config>,
    u: UnparsedConfig,
): Config => {
    return Eithers.map(
        parseConfig(u, configParser),
        errors => { throw new Error(parseErrorsString(errors)) },
        config => config,
    );
}

export const snowflakeIDString = (id: NonEmptyArray<number>): SnowflakeID => {
    return id.map(n => n + 1).join('') as SnowflakeID;
}

export const randomSnowflakeId = (): NonEmptyArray<number> => {
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

export const randomSnowflakeIDString = (): SnowflakeID => {
    return snowflakeIDString(randomSnowflakeId());
}

export type ConfigSynchronizer<State, Config> = {
    [K in keyof Config]: (c: Config, s: State, newValue: Config[K], oldValue: Maybe<Config[K]>) => boolean
};

export const sync = <Config extends Object, State>(
    configSynchronizer: ConfigSynchronizer<State, Config>,
    state: State,
    resetState: () => void,
    oldConfig: Maybe<Config>,
    newConfig: Config,
): void => {
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