import * as Eithers from "./Either";
import { Either, left, right } from "./Either";
import { Maybe, none, some } from "./Maybe";
import * as Maybes from "./Maybe";
import { scheduleUpdate, setIdealMSBetweenUpdates, setSnowflakeCanvasSizePX, State } from "./State";
import * as States from "./State";
import { NonEmptyArray, okOrElse, randomIntInclusive } from "./Utils";

export type UnparsedConfig = {
    snowflakeID: string,
    snowflakeCanvasSizePX: number,
    targetGrowthTimeMS: number,
    upsCap: number,
    maxUpdates: number,
    playing: boolean,
    finishedGrowingCallback: () => void,
    resetCallback: () => void,
    installSnowflakeCanvasCallback: (canvas: HTMLCanvasElement) => void,
    installSnowflakeCanvasFailureCallback: () => void,
};

export type Config = {
    snowflakeID: NonEmptyArray<number>,
    snowflakeCanvasSizePX: number,
    targetGrowthTimeMS: number,
    upsCap: number,
    maxUpdates: number,
    playing: boolean,
    finishedGrowingCallback: () => void,
    resetCallback: () => void,
    installSnowflakeCanvasCallback: (canvas: HTMLCanvasElement) => void,
    installSnowflakeCanvasFailureCallback: () => void,
};

function isBoolean(value: any): value is boolean {
    return typeof value === 'boolean';
}

function isFunction(value: any): boolean {
    return typeof value === 'function';
}

function isFunctionN(value: any, argCount: number): boolean {
    return isFunction(value) && value.length === argCount;
}

function isFunction0(value: any): value is () => any {
    return isFunctionN(value, 0);
}

function isFunction1(value: any): value is (a: any) => any {
    return isFunctionN(value, 1);
}

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
    if (result.length === 0) {
        return left('integer or string containing at least one nonzero digit');
    }
    return right(result as NonEmptyArray<number>);
}

function parseNat(value: any): Either<string, number> {
    if (!Number.isSafeInteger(value)) {
        return left('integer');
    }
    if (value < 0) {
        return left('nonnegative integer');
    }
    return right(value);
}

function makeParser<T>(predicate: (value: any) => value is T, expected: string): (value: any) => Either<string, T> {
    return v => okOrElse(Maybes.then(predicate(v), () => v), () => expected)
}

const parseBool = makeParser(isBoolean, 'boolean');
const parseFunction0 = makeParser(isFunction0, 'function requiring no arguments');
const parseFunction1 = makeParser(isFunction1, 'function requiring one argument');

type ConfigParser = {
    [K in keyof UnparsedConfig]: (value: any) => Either<string, Config[K]>
}

const configParser: ConfigParser = {
    snowflakeID: parseSnowflakeID,
    snowflakeCanvasSizePX: parseNat,
    targetGrowthTimeMS: parseNat,
    upsCap: parseNat,
    maxUpdates: parseNat,
    playing: parseBool,
    finishedGrowingCallback: parseFunction0,
    resetCallback: parseFunction0,
    installSnowflakeCanvasCallback: parseFunction1,
    installSnowflakeCanvasFailureCallback: parseFunction0,
}

type ParserFailure = { expected: string, actual: any };

function isObject(value: any): value is Object {
    return typeof value === 'object' && !Array.isArray(value) && value !== null;
}

function parseConfig(u: UnparsedConfig): Either<Array<ParserFailure>, Config> {
    const errors: Array<ParserFailure> = [];
    const parser: any = configParser;
    const result = {};
    if (!isObject(u)) {
        errors.push({ expected: 'object', actual: JSON.stringify(u) });
        return left(errors);
    }
    if (errors.length > 0) {
        return left(errors);
    }
    for (let [k, v] of Object.entries(u)) {
        const kParser = parser[k];
        if (kParser === undefined) {
            errors.push({ expected: `object without key '${k}'`, actual: u });
        } else {
            const r: Either<string, any> = kParser(v);
            Eithers.map(
                r,
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

function parseErrorString(e: ParserFailure): string {
    return `expected ${e.expected}, received ${e.actual}`;
}

function parseErrorsString(e: Array<ParserFailure>): string {
    return 'errors detected when validating config\n' + e.map(parseErrorString).join('\n');
}

export function parseConfigAndDisplayErrors(u: UnparsedConfig): Config {
    return Eithers.map(
        parseConfig(u),
        errors => { throw new Error(parseErrorsString(errors)) },
        config => config,
    );
}

function snowflakeIDString(id: NonEmptyArray<number>): string {
    return id.map(n => n + 1).join('');
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

export function randomSnowflakeIDString(): string {
    return snowflakeIDString(randomSnowflakeId());
}

export function zero(): Config {
    return parseConfigAndDisplayErrors({
        snowflakeID: randomSnowflakeIDString(),
        snowflakeCanvasSizePX: 800,
        targetGrowthTimeMS: 8000,
        upsCap: 60,
        maxUpdates: 500,
        playing: true,
        finishedGrowingCallback: () => { return; },
        resetCallback: () => { return; },
        installSnowflakeCanvasCallback: (canvas: HTMLCanvasElement) => document.body.appendChild(canvas),
        installSnowflakeCanvasFailureCallback: () => { throw new Error('error installing snowflake canvas'); },
    });
}

export type ConfigSynchronizer = Omit<
    {
        [K in keyof Config]: (c: Config, s: State, newValue: Config[K], oldValue: Maybe<Config[K]>) => boolean
    },
    'isParsed'>;

const configSynchronizer: ConfigSynchronizer = {
    snowflakeID: (_c, s, newValue, oldValue) => {
        const newEqOld = Maybes.map(oldValue, () => false, oldValue => newValue === oldValue);
        if (!newEqOld) {
            s.growthInput = newValue;
            return true;
        }
        return false;
    },
    snowflakeCanvasSizePX: (_c, s, newValue, oldValue) => {
        return Maybes.map(
            oldValue,
            () => setSnowflakeCanvasSizePX(s, newValue),
            oldValue => {
                if (newValue !== oldValue) {
                    return setSnowflakeCanvasSizePX(s, newValue);
                }
                return false;
            }
        );
    },
    targetGrowthTimeMS: (c, s, newValue, oldValue) => {
        setIdealMSBetweenUpdates(s, newValue, c.upsCap);
        return false;
    },
    upsCap: (c, s, newValue, oldValue) => {
        setIdealMSBetweenUpdates(s, c.targetGrowthTimeMS, newValue);
        return false;
    },
    maxUpdates: (_c, s, newValue, oldValue) => {
        return Maybes.map(
            oldValue,
            () => {
                s.maxUpdates = newValue;
                return true;
            },
            oldValue => {
                if (newValue !== oldValue) {
                    s.maxUpdates = newValue;
                    return true;
                }
                return false;
            }
        );
    },
    playing: (_c, s, newValue, oldValue) => {
        const newEqOld = Maybes.map(oldValue, () => false, oldValue => newValue === oldValue);
        if (!newEqOld) {
            s.playing = newValue;
            s.currentMS = performance.now();
            scheduleUpdate(s);
        }
        return false;
    },
    finishedGrowingCallback: (_c, s, newValue, _oldValue) => {
        s.finishedGrowingCallback = newValue;
        return false;
    },
    resetCallback: (_c, s, newValue, _oldValue) => {
        s.resetCallback = newValue;
        return false;
    },
    installSnowflakeCanvasCallback: (_c, s, newValue, _oldValue) => {
        s.installSnowflakeCanvasCallback = newValue;
        return false;
    },
    installSnowflakeCanvasFailureCallback: (_c, s, newValue, _oldValue) => {
        s.installSnowflakeCanvasFailureCallback = newValue;
        return false;
    },
};

export function sync(oldConfig: Maybe<Config>, newConfig: Config, state: State): void {
    const cs: any = configSynchronizer;
    let needsReset = false;
    for (let [k, v] of Object.entries(newConfig)) {
        const oldValue = Maybes.mapSome(oldConfig, old => (old as any)[k]);
        needsReset = cs[k](newConfig, state, v, oldValue) || needsReset;
    }
    if (needsReset) {
        States.reset(state);
    }
}