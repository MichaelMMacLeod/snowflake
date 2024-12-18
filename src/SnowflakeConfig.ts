import { ConfigParser, ConfigSynchronizer, parseBool, parseConfigAndDisplayErrors, parseFunction0, parseFunction1, parseNat, parseSnowflakeID, randomSnowflakeIDString } from "./Config";
import { Either } from "./Either";
import { scheduleUpdate, setIdealMSBetweenUpdates, setSnowflakeCanvasSizePX } from "./State";
import { NonEmptyArray } from "./Utils";
import * as Maybes from "./Maybe";

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

export const configParser: ConfigParser<UnparsedConfig, Config> = {
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

export function zero(): Config {
    return parseConfigAndDisplayErrors(
        configParser,
        {
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
        },
    );
}

export const configSynchronizer: ConfigSynchronizer<Config> = {
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