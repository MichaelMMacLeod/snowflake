import {
    ConfigParser,
    ConfigSynchronizer,
    parseBool,
    parseColorTheme,
    parseConfigAndDisplayErrors,
    parseFunction0,
    parseNat,
    parseSnowflakeID,
    randomSnowflakeIDString
} from "../common/Config.js";
import { scheduleUpdate, setIdealMSBetweenUpdates, setSnowflakeCanvasSizePX, State } from "./State.js";
import * as States from './State.js';
import { arraysEqual, NonEmptyArray, SnowflakeID } from "../common/Utils.js";
import * as Maybes from "maybe-either/Maybe";
import * as ColorThemes from "../common/color/Theme.js";
import { ColorTheme } from "../common/color/Theme.js";

export type UnparsedConfig = Partial<{
    snowflakeID: SnowflakeID,
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
}>;

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

export const zero = (): Config => {
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
            s[States._growthInput] = newValue;
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
                s[States._maxUpdates] = newValue;
                return true;
            },
            oldValue => {
                if (newValue !== oldValue) {
                    s[States._maxUpdates] = newValue;
                    return true;
                }
                return false;
            }
        );
    },
    playing: (_c, s, newValue, oldValue) => {
        const newEqOld = Maybes.map(oldValue, () => false, oldValue => newValue === oldValue);
        if (!newEqOld) {
            s[States._playing] = newValue;
            s[States._currentMS] = performance.now();
            scheduleUpdate(s);
        }
        return false;
    },
    colorTheme: (_c, s, newValue, oldValue) => {
        return Maybes.map(
            oldValue,
            () => {
                s[States._colorTheme] = newValue;
                return true;
            },
            oldValue => {
                if (ColorThemes.equals(newValue, oldValue)) {
                    return false;
                }
                s[States._colorTheme] = newValue;
                return true;
            }
        );
    },
    isLightTheme: (_c, s, newValue, oldValue) => {
        return Maybes.map(
            oldValue,
            () => {
                s[States._isLightTheme] = newValue;
                return true;
            },
            oldValue => {
                if (newValue === oldValue) {
                    return false;
                }
                s[States._isLightTheme] = newValue;
                return true;
            }
        )
    },
    finishedGrowingCallback: (_c, s, newValue, _oldValue) => {
        s[States._finishedGrowingCallback] = newValue;
        return false;
    },
    resetCallback: (_c, s, newValue, _oldValue) => {
        s[States._resetCallback] = newValue;
        return false;
    },
    updatedCallback: (_c, s, newValue, _oldValue) => {
        s[States._updatedCallback] = newValue;
        return false;
    },
};