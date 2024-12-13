import { Either, left, right } from "./Either";
import * as Eithers from "./Either";
import { Maybe } from "./Maybe";
import * as Maybes from "./Maybe";
import { handleEvents, setSnowflakeCanvasSizePX, setSnowflakeId, State } from "./State";
import * as States from "./State";
import { NonEmptyArray, parseSnowflakeId, randomIntInclusive } from "./Utils";

export type Config = {
    // Size in pixels of the side length of the square snowflake canvas.
    snowflakeCanvasSizePX: number,

    // Desired time for the snowflake to fully grow in milliseconds.
    // Actual growth time may be lower if the snowflake hits the edge
    // of the canvas, and higher if the actual updates per second are
    // too low.
    targetGrowthTimeMS: number,

    // Upper bound on the number of updates per second performed.
    upsCap: number,

    // Maximum number of 'growth updates' to the snowflake. The actual
    // number of updates may be lower if the snowflake hits the edge of
    // the canvas before this maximum is reached.
    maxUpdates: number,

    // True if the snowflake is currently allowed to grow, false otherwise.
    playing: boolean,

    // Function to call once the snowflake has finished growing.
    finishedGrowingCallback: () => void,

    // Function to call when the snowflake is reset via a 'reset' event.
    resetCallback: () => void,

    // Function to call when the 'installSnowflakeCanvas' event succeeds.
    installSnowflakeCanvasCallback: (canvas: HTMLCanvasElement) => void,

    // Funciton to call when the 'installSnowflakeCanvas' event fails.
    installSnowflakeCanvasFailureCallback: () => void,

    // Specifies which snowflake to grow. Must be a number without any
    // digits which are zero.
    snowflakeId: string,
};

export type ConfigValidator = {
    [K in keyof Config]: (value: any) => string | undefined
}

function isObject(value: any): boolean {
    return typeof value === 'object' && !Array.isArray(value) && value !== null
}

function isBoolean(value: any): boolean {
    return typeof value === 'boolean';
}

function isFunction(value: any): boolean {
    return typeof value === 'function';
}

function isFunction0(value: any): boolean {
    return isFunction(value) && value.length === 0;
}

function isFunction1(value: any): boolean {
    return isFunction(value) && value.length === 1;
}

function expectSnowflakeId(name: string): (actual: any) => string | undefined {
    return actual => {
        return Eithers.map(
            parseSnowflakeId(actual),
            err => expect(name, 'snowflake ID', err),
            _ => undefined
        );
    };
}

function expect(name: string, kind: string, actual: any): string {
    return `${name}: expected ${kind}, got '${actual}'`;
}

function expectNat(name: string): (actual: any) => string | undefined {
    return actual => {
        if (!Number.isSafeInteger(actual)) {
            return expect(name, 'integer', actual);
        }
        if (actual < 0) {
            return expect(name, 'nonnegative integer', actual);
        }
        return undefined;
    };
}

function expectBool(name: string): (actual: any) => string | undefined {
    return actual => {
        if (!isBoolean(actual)) {
            return expect(name, 'boolean', actual);
        }
        return undefined;
    };
}

function expectFunction0(name: string): (actual: any) => string | undefined {
    return actual => {
        if (!isFunction0(actual)) {
            return expect(name, 'function requiring zero arguments', actual);
        }
    };
}

function expectFunction1(name: string): (actual: any) => string | undefined {
    return actual => {
        if (!isFunction1(actual)) {
            return expect(name, 'function requiring one argument', actual);
        }
    };
}

const configValidator: ConfigValidator = {
    snowflakeCanvasSizePX: expectNat('snowflakeCanvasSizePX'),
    targetGrowthTimeMS: expectNat('targetGrowthTimeMS'),
    upsCap: expectNat('upsCap'),
    maxUpdates: expectNat('maxUpdates'),
    playing: expectBool('playing'),
    finishedGrowingCallback: expectFunction0('finishedGrowingCallback'),
    resetCallback: expectFunction0('resetCallback'),
    installSnowflakeCanvasCallback: expectFunction1('installSnowflakeCanvasCallback'),
    installSnowflakeCanvasFailureCallback: expectFunction0('installSnowflakeCanvasFailureCallback'),
    snowflakeId: expectSnowflakeId('snowflakeId'),
};

function configValidationErrors(config: any): Array<string> {
    const errors: Array<string> = [];
    const cv: any = configValidator;

    if (!isObject(config)) {
        errors.push(`expected config to be an object, but got: '${config}'`);
        return errors;
    }

    for (let [k, _v] of Object.entries(cv)) {
        if (!(k in config)) {
            errors.push(`missing key in config: '${k}'`);
        }
    }
    if (errors.length > 0) {
        return errors;
    }

    for (let [k, v] of Object.entries(config)) {
        const validator = cv[k];
        if (validator === undefined) {
            errors.push(`unexpected key in config: '${k}'`);
        } else {
            const validation = validator(v);
            if (validation !== undefined) {
                errors.push(validation);
            }
        }
    }

    return errors;
}

function validateConfig(config: any): Config | undefined {
    const errors = configValidationErrors(config);
    if (errors.length > 0) {
        console.error('errors detected when validating snowflake configuration');
        errors.forEach(e => console.error(e));
        return undefined;
    }
    return config as Config;
}

export function randomSnowflakeId(): string {
    const digits = [randomIntInclusive(1, 4)];
    for (let i = 1; i < 16; i++) {
        digits.push(randomIntInclusive(1, 9));
    }
    const id = digits.join('');
    return Eithers.map(
        parseSnowflakeId(id),
        _err => { throw new Error(`randomSnowflakeId returned invalid ID: '${id}'`) },
        _id => id
    );
}

export function zero(): Config {
    const config = (() => {
        const config: Config = {
            snowflakeCanvasSizePX: 800,
            targetGrowthTimeMS: 8000,
            upsCap: 60,
            maxUpdates: 500,
            playing: true,
            finishedGrowingCallback: () => { return; },
            resetCallback: () => { return; },
            installSnowflakeCanvasCallback: canvas => document.body.appendChild(canvas),
            installSnowflakeCanvasFailureCallback: () => { throw new Error('error installing snowflake canvas') },
            snowflakeId: randomSnowflakeId(),
        };
        return validateConfig(config);
    })();
    if (config === undefined) {
        throw new Error('default config is invalid');
    }
    return config;
}

export type ConfigSynchronizer = {
    [K in keyof Config]: (s: State, newValue: Config[K], oldValue: Maybe<Config[K]>) => boolean
}

const configSynchronizer: ConfigSynchronizer = {
    snowflakeCanvasSizePX: (s, newValue, oldValue) => {
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
    targetGrowthTimeMS: (s, newValue, _oldValue) => {
        s.targetGrowthTimeMS = newValue;
        return false;
    },
    upsCap: (s, newValue, _oldValue) => {
        s.upsCap = newValue;
        return false;
    },
    maxUpdates: (s, newValue, oldValue) => {
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
    playing: (s, newValue, oldValue) => {
        const newEqOld = Maybes.map(oldValue, () => false, oldValue => newValue === oldValue);
        if (!newEqOld) {
            s.playing = newValue;
            s.currentMS = performance.now();
            handleEvents(s);
        }
        return false;
    },
    finishedGrowingCallback: (s, newValue, _oldValue) => {
        s.finishedGrowingCallback = newValue;
        return false;
    },
    resetCallback: (s, newValue, _oldValue) => {
        s.resetCallback = newValue;
        return false;
    },
    installSnowflakeCanvasCallback: (s, newValue, _oldValue) => {
        s.installSnowflakeCanvasCallback = newValue;
        return false;
    },
    installSnowflakeCanvasFailureCallback: (s, newValue, _oldValue) => {
        s.installSnowflakeCanvasFailureCallback = newValue;
        return false;
    },
    snowflakeId: (s, newValue, oldValue) => {
        const newEqOld = Maybes.map(oldValue, () => false, oldValue => newValue === oldValue);
        if (!newEqOld) {
            setSnowflakeId(s, newValue);
            return true;
        }
        return false;
    }
};

export type ConfigCopier = {
    [K in keyof Config]: (v: Config[K]) => Config[K]
}

const configCopier: ConfigCopier = {
    snowflakeCanvasSizePX: v => {
        return v;
    },
    targetGrowthTimeMS: v => {
        return v;
    },
    upsCap: v => {
        return v;
    },
    maxUpdates: v => {
        return v;
    },
    playing: v => {
        return v;
    },
    finishedGrowingCallback: v => {
        return v;
    },
    resetCallback: v => {
        return v;
    },
    installSnowflakeCanvasCallback: v => {
        return v;
    },
    installSnowflakeCanvasFailureCallback: v => {
        return v;
    },
    snowflakeId: v => {
        return v;
    },
};

export function copy(config: Config): Config {
    const result = zero();
    for (let [k, v] of Object.entries(config)) {
        (result as any)[k] = (configCopier as any)[k](v);
    }
    return result;
}

export function sync(oldValidatedConfig: Maybe<Config>, newUnvalidatedConfig: Config, state: State): void {
    const maybeConfig = validateConfig(newUnvalidatedConfig);
    if (maybeConfig === undefined) {
        return;
    }
    const config = maybeConfig;
    const cs: any = configSynchronizer;

    let needsReset = false;
    for (let [k, v] of Object.entries(config)) {
        const oldValue = Maybes.mapSome(oldValidatedConfig, old => (old as any)[k]);
        needsReset = cs[k](state, v, oldValue) || needsReset;
    }
    if (needsReset) {
        States.reset(state);
    }
}