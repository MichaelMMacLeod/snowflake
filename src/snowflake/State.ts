import { Graphic } from "./Graphic";
import * as Graphics from "./Graphic";
import { addBranchesToGrowingFaces, addFacesToGrowingBranches, Snowflake } from "./Snowflake";
import * as Snowflakes from "./Snowflake";
import * as Branches from "./Branch";
import * as Faces from "./Face";
import { fracPart, GrowthType, interpretGrowth, NonEmptyArray } from "../common/Utils";
import { isSome, mapSome, Maybe, none } from "../common/Maybe";
import * as Maybes from "../common/Maybe";
import * as RGBA from "../common/color/Color";
import * as ColorThemes from "../common/color/Theme";
import { ColorTheme } from "../common/color/Theme";

export type State = {
    growthInput: NonEmptyArray<number>,
    graphic: Maybe<Graphic>,
    snowflake: Snowflake,
    currentGrowthType: GrowthType | undefined,
    idealMSBetweenUpdates: number,
    growing: boolean,
    hasScheduledUpdate: boolean,

    colorTheme: ColorTheme,
    isLightTheme: boolean,

    // Running total number of updates since last reset.
    updateCount: number,

    // Current time as of the start of the last update.
    currentMS: number,

    // The interval that the update function is called at is not
    // completely under our control. It may be called sooner or later
    // than we require. Because of this, we may calculate that we need to
    // do a fractional number of updates in a single call to update. For
    // example, we could calculate that we need to do 2.5 updates. To avoid
    // doing 'fractional updates', we instead simply perform 2 whole updates,
    // store the 0.5 in this 'updateBank', and then include the 'updateBank'
    // value in our future calculations.
    //
    // If we were to throw away these fractional updates, we would skip over
    // required updates which would slow down the growth of the snowflake,
    // throwing us off our desired time-to-grown.
    updateBank: number,

    maxUpdates: number,

    resetStartTime: number,

    playing: boolean,
    finishedGrowingCallback: () => void,
    needsReset: boolean,
    resetCallback: () => void,
    installSnowflakeCanvasCallback: (canvas: HTMLCanvasElement) => void,
    installSnowflakeCanvasFailureCallback: () => void,
    updatedCallback: () => void,

    updateOnNextFrame: () => void,
    doUpdate: () => void,
};

function currentThemeForegroundRGBAString(state: State): string {
    if (state.isLightTheme) {
        return RGBA.toString(state.colorTheme.light.foreground);
    }
    return RGBA.toString(state.colorTheme.dark.foreground);
}

export function reset(state: State): void {
    state.needsReset = true;
    scheduleUpdate(state);
}

export function setSnowflakeCanvasSizePX(state: State, snowflakeCanvasSizePX: number): boolean {
    mapSome(state.graphic, g => {
        g.sizePX = snowflakeCanvasSizePX;
        g.ctx.canvas.width = snowflakeCanvasSizePX;
        g.ctx.canvas.height = snowflakeCanvasSizePX;
        g.canvas.style.width = `${snowflakeCanvasSizePX}px`;
        g.canvas.style.height = `${snowflakeCanvasSizePX}px`;
    });
    return isSome(state.graphic);
}

export function initializeGraphic(state: State, snowflakeCanvasSizePX: number): Maybe<Graphic> {
    return Maybes.orElse(state.graphic, () => {
        state.graphic = Graphics.make(snowflakeCanvasSizePX);
        return state.graphic;
    });
}

export function scheduleUpdate(state: State): void {
    if (state.hasScheduledUpdate) {
        return;
    } else if (state.growing && state.playing || state.needsReset) {
        state.hasScheduledUpdate = true;
        setTimeout(state.updateOnNextFrame, state.idealMSBetweenUpdates);
    } else {
        state.hasScheduledUpdate = false;
    }
}

export function setIdealMSBetweenUpdates(state: State, targetGrowthTimeMS: number, upsCap: number): void {
    state.idealMSBetweenUpdates = Math.max(1000 / upsCap, targetGrowthTimeMS / state.maxUpdates);
}

export function zero(): State {
    const snowflake = Snowflakes.zero();

    // These defaults are overwritten in Controller which synchronizes
    // this state with the default Config. It's the values in the 
    // default Config that matter.
    const result: State = {
        growthInput: [0],
        graphic: none(),
        snowflake,
        currentGrowthType: undefined,
        growing: true,
        updateBank: 0,
        updateCount: 0,
        currentMS: 0,
        idealMSBetweenUpdates: 0,
        maxUpdates: 500,
        resetStartTime: performance.now(),
        playing: false,
        finishedGrowingCallback: () => { return; },
        needsReset: false,
        resetCallback: () => { return; },
        installSnowflakeCanvasCallback: _ => { return; },
        installSnowflakeCanvasFailureCallback: () => { return; },
        hasScheduledUpdate: false,
        colorTheme: ColorThemes.zero(),
        isLightTheme: true,
        updatedCallback: () => { return; },
        updateOnNextFrame: () => { requestAnimationFrame(result.doUpdate); },
        doUpdate: () => {
            update(result);
            result.hasScheduledUpdate = false;
            scheduleUpdate(result);
        }
    };

    scheduleUpdate(result);

    return result;
}

export function percentGrown(state: State): number {
    return state.updateCount / state.maxUpdates;
}

export function update(state: State): void {
    if (state.needsReset) {
        state.needsReset = false;
        Snowflakes.zeroM(state.snowflake);
        state.currentGrowthType = undefined;
        state.growing = true;
        state.updateBank = 0;
        state.updateCount = 0;
        mapSome(state.graphic, g => Graphics.clear(g));
        state.currentMS = performance.now();
        state.resetStartTime = performance.now();
        state.resetCallback();
    }

    const snowflake = state.snowflake;

    const lastMS = state.currentMS;
    state.currentMS = performance.now();
    const deltaMS = state.currentMS - lastMS;

    let requiredUpdates = Math.min(state.maxUpdates - state.updateCount, deltaMS / state.idealMSBetweenUpdates + state.updateBank);
    state.updateBank = fracPart(requiredUpdates);
    requiredUpdates = Math.floor(requiredUpdates);

    function doUpdate() {
        const growth = interpretGrowth(state.growthInput, percentGrown(state));

        if (state.currentGrowthType === undefined) {
            state.currentGrowthType = growth.growthType;
        }

        if (state.currentGrowthType !== growth.growthType) {
            state.currentGrowthType = growth.growthType;
            if (state.currentGrowthType === 'branching') {
                addBranchesToGrowingFaces(snowflake);
            } else {
                addFacesToGrowingBranches(snowflake);
            }
        }

        Snowflakes.cacheNormalizedSides(snowflake);

        if (state.currentGrowthType === 'branching') {
            Snowflakes.killCoveredBranches(snowflake);
            Snowflakes.forEachGrowingBranch(snowflake, (b, _) => Branches.enlarge(b, growth.scale));
        } else {
            Snowflakes.killCoveredFaces(snowflake);
            Snowflakes.forEachGrowingFace(snowflake, (f, _) => Faces.enlarge(f, growth.scale));
        }

        mapSome(state.graphic, g => {
            const foregroundColor = currentThemeForegroundRGBAString(state);
            if (Snowflakes.draw(g, snowflake, foregroundColor)) {
                state.updateCount = state.maxUpdates;
                state.updateBank = 0;
                let v = window as any;
                if (v.count === undefined) {
                    v.count = 0;
                }
                v.count += 1;
                console.log(`too large count = ${v.count}, ${state.growthInput}`);
            }
        });
    }

    for (let i = 0; i < requiredUpdates && state.updateCount < state.maxUpdates; ++i) {
        state.updateCount += 1;
        doUpdate();
    }

    state.updatedCallback();

    if (state.updateCount >= state.maxUpdates) {
        state.updateCount = state.maxUpdates;
        state.finishedGrowingCallback();
        state.growing = false;
    }
}