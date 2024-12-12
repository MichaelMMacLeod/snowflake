import { State } from "./State";
import * as States from "./State";

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
        };
        return validateConfig(config);
    })();
    if (config === undefined) {
        throw new Error('default config is invalid');
    }
    return config;
}

export type ConfigSynchronizer = {
    [K in keyof Config]: (s: State, v: Config[K]) => void
}

const configSynchronizer: ConfigSynchronizer = {
    snowflakeCanvasSizePX: (s, v) => {
        s.snowflakeCanvasSizePX = v;
        if (s.graphic === undefined) {
            return;
        }
        s.graphic.ctx.canvas.width = v;
        s.graphic.ctx.canvas.height = v;
        s.graphic.canvas.style.width = `${v}px`;
        s.graphic.canvas.style.height = `${v}px`;
    },
    targetGrowthTimeMS: (s, v) => {
        s.targetGrowthTimeMS = v;
    },
    upsCap: (s, v) => {
        s.upsCap = v;
    },
    maxUpdates: (s, v) => {
        s.maxUpdates = v;
    },
    playing: (s, v) => {
        s.playing = v;
    },
    finishedGrowingCallback: (s, v) => {
        s.finishedGrowingCallback = v;
    },
    resetCallback: (s, v) => {
        s.resetCallback = v;
    },
    installSnowflakeCanvasCallback: (s, v) => {
        s.installSnowflakeCanvasCallback = v;
    },
    installSnowflakeCanvasFailureCallback: (s, v) => {
        s.installSnowflakeCanvasFailureCallback = v;
    },
};

export function sync(unvalidatedConfig: Config, state: State): void {
    const maybeConfig = validateConfig(unvalidatedConfig);
    if (maybeConfig === undefined) {
        return;
    }
    const config = maybeConfig;
    const cs: any = configSynchronizer;

    for (let [k, v] of Object.entries(config)) {
        cs[k](state, v);
    }

    States.reset(state);
}