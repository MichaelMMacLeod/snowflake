import { ConfigParser, ConfigSynchronizer, parseBool, parseConfigAndDisplayErrors, parseFunction0, parseFunction1, parseNat, parseNonnegativeFloat, parsePositiveFloat, parseSnowflakeID, randomSnowflakeIDString } from "./Config";
import { Either } from "./Either";
import { scheduleUpdate, setIdealMSBetweenUpdates, setSnowflakeCanvasSizePX } from "./SnowflakeState";
import { arraysEqual, NonEmptyArray } from "./Utils";
import * as Maybes from "./Maybe";
import { GraphState, setAspectRatio, setPercentGrown, setSnowflakeID } from "./SnowflakeGraphState";

export type UnparsedConfig = {
    percentGrown: number,
    snowflakeID: string,
    aspectRatio: number,
    handleMovedCallback: (snowflakeID: string) => void,
};

export type Config = {
    percentGrown: number,
    snowflakeID: NonEmptyArray<number>,
    aspectRatio: number,
    handleMovedCallback: (snowflakeID: string) => void,
};

export const configParser: ConfigParser<UnparsedConfig, Config> = {
    percentGrown: parseNonnegativeFloat,
    snowflakeID: parseSnowflakeID,
    aspectRatio: parsePositiveFloat,
    handleMovedCallback: parseFunction1,
};

export function zero(): Config {
    return parseConfigAndDisplayErrors(
        configParser,
        {
            percentGrown: 0,
            snowflakeID: randomSnowflakeIDString(),
            aspectRatio: 3,
            handleMovedCallback: _id => { return; },
        },
    );
}

export const configSynchronizer: ConfigSynchronizer<GraphState, Config> = {
    percentGrown: (_c, s, newValue, oldValue) => {
        const newEqOld = Maybes.map(oldValue, () => false, oldValue => newValue === oldValue);
        if (!newEqOld) {
            setPercentGrown(s, newValue);
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
    handleMovedCallback: (_c, s, newValue, oldValue) => {
        Maybes.mapSome(s.graph, g => g.handleMovedCallback = newValue);
        return false;
    },
};