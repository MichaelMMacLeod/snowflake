import {
    ConfigParser,
    ConfigSynchronizer,
    parseBool,
    parseColorTheme,
    parseConfigAndDisplayErrors,
    parseFunction0,
    parseFunction1,
    parseNat,
    parseSnowflakeID,
    randomSnowflakeIDString
} from "../common/Config";
import { scheduleUpdate, setIdealMSBetweenUpdates, setSnowflakeCanvasSizePX, State } from "./State";
import { arraysEqual, NonEmptyArray } from "../common/Utils";
import * as Maybes from "../common/Maybe";
import * as ColorThemes from "../common/color/Theme";
import { ColorTheme } from "../common/color/Theme";

export type UnparsedConfig = {
    snowflakeID: string,
    snowflakeCanvasSizePX: number,
    targetGrowthTimeMS: number,
    upsCap: number,
    maxUpdates: number,
    playing: boolean,
    colorTheme: ColorTheme,
    isLightTheme: boolean,
    finishedGrowingCallback: () => void,
    resetCallback: () => void,
    updatedCallback: () => void,
};

export type Config = {
    snowflakeID: NonEmptyArray<number>,
    snowflakeCanvasSizePX: number,
    targetGrowthTimeMS: number,
    upsCap: number,
    maxUpdates: number,
    playing: boolean,
    colorTheme: ColorTheme,
    isLightTheme: boolean,
    finishedGrowingCallback: () => void,
    resetCallback: () => void,
    updatedCallback: () => void,
};

export const configParser: ConfigParser<UnparsedConfig, Config> = {
    snowflakeID: parseSnowflakeID,
    snowflakeCanvasSizePX: parseNat,
    targetGrowthTimeMS: parseNat,
    upsCap: parseNat,
    maxUpdates: parseNat,
    playing: parseBool,
    colorTheme: parseColorTheme,
    isLightTheme: parseBool,
    finishedGrowingCallback: parseFunction0,
    resetCallback: parseFunction0,
    updatedCallback: parseFunction0,
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
            colorTheme: ColorThemes.zero(),
            isLightTheme: true,
            finishedGrowingCallback: () => { return; },
            resetCallback: () => { return; },
            updatedCallback: () => { return; },
        },
    );
}

export const configSynchronizer: ConfigSynchronizer<State, Config> = {
    snowflakeID: (_c, s, newValue, oldValue) => {
        const newEqOld = Maybes.map(
            oldValue,
            () => false,
            oldValue => arraysEqual(newValue, oldValue, (a, b) => a === b)
        );
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
    colorTheme: (_c, s, newValue, oldValue) => {
        return Maybes.map(
            oldValue,
            () => {
                s.colorTheme = newValue;
                return true;
            },
            oldValue => {
                if (ColorThemes.equals(newValue, oldValue)) {
                    return false;
                }
                s.colorTheme = newValue;
                return true;
            }
        );
    },
    isLightTheme: (_c, s, newValue, oldValue) => {
        return Maybes.map(
            oldValue,
            () => {
                s.isLightTheme = newValue;
                return true;
            },
            oldValue => {
                if (newValue === oldValue) {
                    return false;
                }
                s.isLightTheme = newValue;
                return true;
            }
        )
    },
    finishedGrowingCallback: (_c, s, newValue, _oldValue) => {
        s.finishedGrowingCallback = newValue;
        return false;
    },
    resetCallback: (_c, s, newValue, _oldValue) => {
        s.resetCallback = newValue;
        return false;
    },
    updatedCallback: (_c, s, newValue, _oldValue) => {
        s.updatedCallback = newValue;
        return false;
    },
};