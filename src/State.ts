import {
    callIfInstalled,
    defaultGraphInstallationOptions,
    defaultGraphOptions,
    drawGrowthInput,
    Graph,
    GraphInstallationOptions,
    GraphOptions,
    GrowthType,
    interpretGrowth,
    randomizeGrowthInput,
    updateGraph
} from "./Graph";
import * as Graphs from "./Graph";
import { Graphic, GraphicOptions } from "./Graphic";
import * as Graphics from "./Graphic";
import { addBranchesToGrowingFaces, addFacesToGrowingBranches, Snowflake } from "./Snowflake";
import * as Snowflakes from "./Snowflake";
import * as Branches from "./Branch";
import * as Faces from "./Face";
import { fracPart } from "./Utils";

type InstallSnowflakeEvent = {
    kind: 'installSnowflake',
    options: GraphicOptions,
    installCanvas: (snowflake: HTMLCanvasElement) => void,
    onNoContextFailure: () => void,
};

type InstallGraphEvent = {
    kind: 'installGraph',
    options: GraphInstallationOptions,
    installCanvas: (graph: HTMLCanvasElement) => void,
    onNoContextFailure: () => void,
};

type PlayEvent = {
    kind: 'play',
    play: boolean | 'toggle',
};

type ResetEvent = {
    kind: 'reset',
};

type RandomizeEvent = {
    kind: 'randomize',
};

type HaltEvent = {
    kind: 'halt',
};

type RegisterFinishedGrowingCallback = {
    kind: 'registerFinishedGrowingCallback',
    callback: () => void,
}

type RegisterResetCallback = {
    kind: 'registerResetCallback',
    callback: () => void,
}

export type StateEvent =
    InstallSnowflakeEvent
    | InstallGraphEvent
    | PlayEvent
    | ResetEvent
    | RandomizeEvent
    | HaltEvent
    | RegisterFinishedGrowingCallback
    | RegisterResetCallback;

export type EventHandlers<Events extends { kind: string }> = {
    [E in Events as E["kind"]]: (data: E) => void
};
export type StateEventHandlers = EventHandlers<StateEvent>;

export type State = {
    graph: Graph,
    graphic: Graphic | undefined,
    snowflake: Snowflake,
    currentGrowthType: GrowthType | undefined,

    // Specifies a lower bound on how long it will take to grow the
    // snowflake, in milliseconds.
    targetGrowthTimeMS: number,

    upsCap: number,

    // Running total number of updates since last reset.
    updateCount: number,

    // Current time as of the start of the last update.
    currentMS: number,

    // Amount of time the snowflake has been growing for.
    currentElapsedMS: number,

    playing: boolean,
    eventHandlerTimeout: NodeJS.Timeout | undefined,
    eventQueue: Array<StateEvent>,
    eventHandlers: StateEventHandlers | undefined,
    finishedGrowingCallbacks: Array<() => void>,
    resetCallbacks: Array<() => void>,
};

function makeEventHandlers(state: State): StateEventHandlers {
    return {
        installSnowflake: ({ options, installCanvas, onNoContextFailure }) => {
            if (state.graphic !== undefined) {
                throw new Error('snowflake already installed');
            }
            state.graphic = Graphics.make(options);
            if (state.graphic === undefined) {
                onNoContextFailure();
            } else {
                installCanvas(state.graphic.canvas);
            }
        },
        installGraph: ({ options, installCanvas, onNoContextFailure }) => {
            Graphs.install(state.graph, options);
            if (state.graph.installation === undefined) {
                onNoContextFailure();
            } else {
                installCanvas(state.graph.installation.canvas);
            }
        },
        play: ({ play }) => {
            if (play === 'toggle') {
                state.playing = !state.playing;
            } else {
                state.playing = play;
            }
        },
        reset: _ => {
            Snowflakes.reset(state.snowflake);
            state.currentElapsedMS = 0;
            state.currentGrowthType = undefined;
            state.updateCount = 0;
            if (state.graphic !== undefined) {
                Graphics.clear(state.graphic);
            }
            state.resetCallbacks.forEach(callback => callback());
        },
        randomize: _ => {
            randomizeGrowthInput(state.graph)
        },
        halt: _ => {
            clearInterval(state.eventHandlerTimeout);
            state.graph.installation?.removeEventListeners();
        },
        registerFinishedGrowingCallback: ({ callback }) => {
            state.finishedGrowingCallbacks.push(callback);
        },
        registerResetCallback: ({ callback }) => {
            state.resetCallbacks.push(callback);
        },
    };
}

export function handleEvent(state: State, e: StateEvent): void {
    if (state.eventHandlers !== undefined) {
        state.eventHandlers[e.kind](e as any /* FIXME */);
    } else {
        throw new Error("state.eventHandlers is undefined");
    }
}

export function handleEvents(state: State): void {
    state.eventQueue.forEach(e => handleEvent(state, e));
    state.eventQueue.length = 0;
    update(state);
}

function requiredUpdatesToGrowSnowflake(canvasSizePX: number): number {
    const REQUIRED_ON_800_PX_CANVAS = 500;
    return (canvasSizePX / 800) * REQUIRED_ON_800_PX_CANVAS;
}

// function msBetweenUpdates(canvasSizePX: number, targetGrowthTimeMS: number, upsCap: number): number {
//     const ru = requiredUpdatesToGrowSnowflake(canvasSizePX);

// }

function lowerBoundMSBetweenUpdates(canvasSizePX: number, targetGrowthTimeMS: number, upsCap: number): number {
    return Math.max(1000 / upsCap, targetGrowthTimeMS / requiredUpdatesToGrowSnowflake(canvasSizePX));
}

export function make(): State {
    const graph = Graphs.make(defaultGraphOptions());
    const snowflake = Snowflakes.zero();

    const result: State = {
        graph,
        graphic: undefined,
        snowflake,
        currentGrowthType: undefined,
        updateCount: 0,
        currentMS: 0,
        currentElapsedMS: 0,
        targetGrowthTimeMS: 8000,
        upsCap: 60,
        playing: false,
        eventQueue: [],
        eventHandlers: undefined,
        eventHandlerTimeout: undefined,
        finishedGrowingCallbacks: [],
        resetCallbacks: [],
    };
    result.eventHandlers = makeEventHandlers(result);

    const BROWSER_SET_INTERVAL_MIN_INTERVAL = 4;
    const actualUps = Math.max(1000 / result.upsCap, BROWSER_SET_INTERVAL_MIN_INTERVAL);
    result.eventHandlerTimeout = setInterval(() => handleEvents(result), actualUps)

    return result;
}

export function receiveEvent(state: State, e: StateEvent): void {
    state.eventQueue.push(e);
}

function currentTime(state: State): number {
    const sizePX = state.graphic?.sizePX;
    if (sizePX === undefined) {
        throw new Error('undefined sizePX');
    }
    return state.updateCount / requiredUpdatesToGrowSnowflake(sizePX);
}

export function update(state: State): void {
    const {
        snowflake,
        graph,
        graphic,
        playing,
    } = state;
    // state.graph.growthInput = [8, 0, 8, 0, 8, 0, 8, 0, 8, 0, 8, 0, 8, 0, 8, 0];

    const lastMS = state.currentMS;
    // const lastElapsedMS = state.currentElapsedMS;
    state.currentMS = performance.now();
    const deltaMS = state.currentMS - lastMS;

    const sizePX = state.graphic?.sizePX;
    if (sizePX === undefined) {
        throw new Error('undefined sizePX');
    }
    
    const desiredMSBetweenUpdates = lowerBoundMSBetweenUpdates(sizePX, state.targetGrowthTimeMS, state.upsCap);

    const actualMSBetweenUpdates = deltaMS;

    const maxUpdates = requiredUpdatesToGrowSnowflake(sizePX);
    const remainingUpdates = Math.max(0, maxUpdates - state.updateCount);
    let requiredUpdates = Math.min(remainingUpdates, actualMSBetweenUpdates / desiredMSBetweenUpdates);

    if (requiredUpdates < 1) {
        state.currentMS = lastMS;
        return;
    }

    function doUpdate(thisUpdateGrowthScalar: number) {
        const growth = interpretGrowth(graph, currentTime(state));

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
            snowflake.branches.forEach(b => {
                if (b.growing) {
                    Branches.enlarge(b, growth.scale, thisUpdateGrowthScalar)
                }
            });
        } else {
            Snowflakes.killCoveredFaces(snowflake);
            snowflake.faces.forEach(f => {
                if (f.growing) {
                    Faces.enlarge(f, growth.scale, thisUpdateGrowthScalar)
                }
            });
        }

        if (graphic !== undefined) {
            Snowflakes.draw(graphic, snowflake, thisUpdateGrowthScalar);
        }
    }

    if (playing) {
        state.currentElapsedMS += deltaMS;
        const willUpdateAtLeastOnce = requiredUpdates > 0;
        const updatesThatWillBePerformed = requiredUpdates;

        for (; requiredUpdates > 0; requiredUpdates -= Math.min(1, requiredUpdates)) {
            state.updateCount += 1;
            const growthScalar = 1;
            doUpdate(growthScalar);
        }

        if (willUpdateAtLeastOnce && state.updateCount >= maxUpdates) {
            state.finishedGrowingCallbacks.forEach(callback => callback());
        }
    }

    const percentDone = state.updateCount / maxUpdates;

    callIfInstalled(graph, i => {
        updateGraph(graph, i);
        i.ctx.clearRect(0, 0, i.canvas.width, i.canvas.height);
        drawGrowthInput(graph, i, percentDone);
    });
}