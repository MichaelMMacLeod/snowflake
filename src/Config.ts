import { Either, left, right } from "./Either";
import * as Eithers from "./Either";
import { Maybe, none, some } from "./Maybe";
import * as Maybes from "./Maybe";
import { scheduleUpdate, installGraphCanvas, setGraphCanvasHeight, setGraphCanvasWidth, setIdealMSBetweenUpdates, setSnowflakeCanvasSizePX, setSnowflakeId, State } from "./State";
import * as States from "./State";
import { NonEmptyArray, parseSnowflakeId, randomIntInclusive, RGBA } from "./Utils";

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

    graphCanvasWidthPX: number,
    graphCanvasHeightPX: number,
    graphProgressColor: string,
    graphProgressLineColor: string,
    graphBackgroundColor: string,
    graphForegroundColor: string,

    // Mouse up events, which stop the graph handles from being dragged, if
    // received by the canvas itself, annoyingly stops the handle even when the
    // mouse just goes a little bit outside the graph. To fix this, we set the
    // mouse up event listener on a parent node, usually the document itself.
    graphMouseUpEventListenerNode: Node,

    // Function to call when the 'installGraphCanvas' event succeeds.
    installGraphCanvasCallback: (canvas: HTMLCanvasElement) => void,

    // Function to call when the 'installGraphCanvas' event fails.
    installGraphCanvasFailureCallback: () => void,

    // Specifies which snowflake to grow. Must be a number without any
    // digits which are zero.
    snowflakeId: string,
};

export type ConfigValidator = {
    [K in keyof Config]: (value: any) => Maybe<string>
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

function isFunctionN(value: any, argCount: number): boolean {
    return isFunction(value) && value.length === argCount;
}

function isFunction0(value: any): boolean {
    return isFunctionN(value, 0);
}

function isFunction1(value: any): boolean {
    return isFunctionN(value, 1);
}

function isFunction2(value: any): boolean {
    return isFunctionN(value, 2);
}

function isCssColor(value: any): boolean {
    return CSS.supports('color', value);
}

function isEventListenerRegistrant(value: any): boolean {
    return value.addEventListener !== undefined
        && value.removeEventListener !== undefined
        && isFunction2(value.addEventListener) && isFunction2(value.removeEventListener);
}

function expect(name: string, kind: string, actual: any): string {
    return `${name}: expected ${kind}, got '${actual}'`;
}

function expectSnowflakeId(name: string): (actual: any) => Maybe<string> {
    return actual => {
        return Eithers.map(
            parseSnowflakeId(actual),
            err => some(expect(name, 'snowflake ID', err)),
            _ => none(),
        );
    };
}

function expectNat(name: string): (actual: any) => Maybe<string> {
    return actual => {
        if (!Number.isSafeInteger(actual)) {
            return some(expect(name, 'integer', actual));
        }
        if (actual < 0) {
            return some(expect(name, 'nonnegative integer', actual));
        }
        return none();
    };
}

function expectBool(name: string): (actual: any) => Maybe<string> {
    return actual => {
        return Maybes.then(!isBoolean(actual), () => expect(name, 'boolean', actual));
    };
}

function expectFunction0(name: string): (actual: any) => Maybe<string> {
    return actual => {
        return Maybes.then(
            !isFunction0(actual),
            () => expect(name, 'function requiring zero arguments', actual)
        );
    };
}

function expectFunction1(name: string): (actual: any) => Maybe<string> {
    return actual => {
        return Maybes.then(
            !isFunction1(actual),
            () => expect(name, 'function requiring one argument', actual),
        );
    };
}

function expectCssColor(name: string): (actual: any) => Maybe<string> {
    return actual => {
        return Maybes.then(
            !isCssColor(actual),
            () => expect(name, 'valid css color', actual)
        );
    };
}

function expectEventListenerRegistrant(name: string): (actual: any) => Maybe<string> {
    return actual => {
        return Maybes.then(
            !isEventListenerRegistrant(actual),
            () => expect(name, 'html node with .addEventListener and .removeEventListener', actual),
        );
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
    installGraphCanvasCallback: expectFunction1('installGraphCanvasCallback'),
    installGraphCanvasFailureCallback: expectFunction0('installGraphCanvasFailureCallback'),
    snowflakeId: expectSnowflakeId('snowflakeId'),
    graphCanvasWidthPX: expectNat('graphCanvasWidthPX'),
    graphCanvasHeightPX: expectNat('graphCanvasHeightPX'),
    graphProgressColor: expectCssColor('graphProgressColor'),
    graphProgressLineColor: expectCssColor('graphProgressLineColor'),
    graphBackgroundColor: expectCssColor('graphBackgroundColor'),
    graphForegroundColor: expectCssColor('graphForegroundColor'),
    graphMouseUpEventListenerNode: expectEventListenerRegistrant('graphMouseUpEventListenerNode'),
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
            const validation: Maybe<string> = validator(v);
            Maybes.map(
                validation,
                () => { return; },
                validation => errors.push(validation),
            );
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
            installSnowflakeCanvasFailureCallback: () => { throw new Error('error installing snowflake canvas'); },
            installGraphCanvasCallback: canvas => document.body.appendChild(canvas),
            installGraphCanvasFailureCallback: () => { throw new Error('error installing graph canvas'); },
            snowflakeId: randomSnowflakeId(),
            graphCanvasWidthPX: 800,
            graphCanvasHeightPX: 300,
            graphProgressColor: 'rgba(255,255,255,0.5)',
            graphProgressLineColor: 'rgba(255,255,255,1)',
            graphBackgroundColor: 'rgba(0,0,0,1)',
            graphForegroundColor: 'rgba(255,255,255,1)',
            graphMouseUpEventListenerNode: document,
        };
        return validateConfig(config);
    })();
    if (config === undefined) {
        throw new Error('default config is invalid');
    }
    return config;
}

export type ConfigSynchronizer = {
    [K in keyof Config]: (c: Config, s: State, newValue: Config[K], oldValue: Maybe<Config[K]>) => boolean
}

const configSynchronizer: ConfigSynchronizer = {
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
        // return Maybes.map(oldValue, () => true, o => o !== newValue);
    },
    upsCap: (c, s, newValue, oldValue) => {
        setIdealMSBetweenUpdates(s, c.targetGrowthTimeMS, newValue);
        // return Maybes.map(oldValue, () => true, o => o !== newValue);
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
    installGraphCanvasCallback: (_c, s, newValue, _oldValue) => {
        s.installGraphCanvasCallback = newValue;
        return false;
    },
    installGraphCanvasFailureCallback: (_c, s, newValue, _oldValue) => {
        s.installGraphCanvasFailureCallback = newValue;
        return false;
    },
    snowflakeId: (_c, s, newValue, oldValue) => {
        const newEqOld = Maybes.map(oldValue, () => false, oldValue => newValue === oldValue);
        if (!newEqOld) {
            setSnowflakeId(s, newValue);
            return true;
        }
        return false;
    },
    graphCanvasWidthPX: (_c, s, newValue, _oldValue) => {
        setGraphCanvasWidth(s, newValue);
        return false;
    },
    graphCanvasHeightPX: (_c, s, newValue, _oldValue) => {
        setGraphCanvasHeight(s, newValue);
        return false;
    },
    graphProgressColor: (_c, s, newValue, _oldValue) => {
        s.graph.options.progressColor = newValue;
        return false;
    },
    graphProgressLineColor: (_c, s, newValue, _oldValue) => {
        s.graph.options.progressLineColor = newValue;
        return false;
    },
    graphBackgroundColor: (_c, s, newValue, _oldValue) => {
        s.graph.options.backgroundColor = newValue;
        return false;
    },
    graphForegroundColor: (_c, s, newValue, _oldValue) => {
        s.graph.options.foregroundColor = newValue;
        return false;
    },
    graphMouseUpEventListenerNode: (_c, s, newValue, oldValue) => {
        // console.log('graphMouseUpEventListenerNode config setting not yet implemented');
        // Maybes.map(
        //     oldValue,
        //     () => {
        //         if (s.graph.installation === undefined) {
        //             return;
        //         }
        //         s.graph.installation.
        //     },
        //     _ => {
        //         throw new Error('installing graph more than once not currently supported');
        //     }
        // );
        return false;
    }
};

export function copy(config: Config): Config {
    const result = zero();
    for (let [k, v] of Object.entries(config)) {
        (result as any)[k] = v;
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
        needsReset = cs[k](config, state, v, oldValue) || needsReset;
    }
    if (needsReset) {
        States.reset(state);
    }
}