import { ConfigParser, ConfigSynchronizer, parseBool, parseConfigAndDisplayErrors, parseFunction0, parseFunction1, parseNat, parseNonnegativeFloat, parsePositiveFloat, parseSnowflakeID, randomSnowflakeIDString } from "./Config";
import { Either } from "./Either";
import { scheduleUpdate, setIdealMSBetweenUpdates, setSnowflakeCanvasSizePX } from "./State";
import { arraysEqual, NonEmptyArray } from "./Utils";
import * as Maybes from "./Maybe";
import { GraphState, setAspectRatio, setPercentDone, setSnowflakeID } from "./SnowflakeGraphState";

export type UnparsedConfig = {
    percentGrown: number,
    snowflakeID: string,
    aspectRatio: number,
};

export type Config = {
    percentGrown: number,
    snowflakeID: NonEmptyArray<number>,
    aspectRatio: number,
};

export const configParser: ConfigParser<UnparsedConfig, Config> = {
    percentGrown: parseNonnegativeFloat,
    snowflakeID: parseSnowflakeID,
    aspectRatio: parsePositiveFloat,
};

export function zero(): Config {
    return parseConfigAndDisplayErrors(
        configParser,
        {
            percentGrown: 0,
            snowflakeID: randomSnowflakeIDString(),
            aspectRatio: 3,
        },
    );
}

export const configSynchronizer: ConfigSynchronizer<GraphState, Config> = {
    percentGrown: (_c, s, newValue, oldValue) => {
        const newEqOld = Maybes.map(oldValue, () => false, oldValue => newValue === oldValue);
        if (!newEqOld) {
            setPercentDone(s, newValue);
            return true;
        }
        return false;
    },
    snowflakeID: (_c, s, newValue, oldValue) => {
        const eqNumber = (a: number, b: number) => a === b;
        const newEqOld = Maybes.map(oldValue, () => false, oldValue => arraysEqual(newValue, oldValue, eqNumber));
        if (!newEqOld) {
            setSnowflakeID(s, newValue);
            return true;
        }
        return false;
    },
    aspectRatio: (_c, s, newValue, oldValue) => {
        const newEqOld = Maybes.map(oldValue, () => false, oldValue => newValue === oldValue);
        if (!newEqOld) {
            setAspectRatio(s, newValue);
            return true;
        }
        return false;
    },
};