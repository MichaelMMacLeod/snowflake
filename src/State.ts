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

    // Current time as of the start of the last update.
    currentMS: number,

    // Amount of time the snowflake has been growing for.
    currentElapsedMS: number,

    // Specifies total time it will take to grow the snowflake.
    // For example, `allotedGrowthTime = 8000` means it will take eight
    // seconds for the snowflake to grow.
    allotedGrowthTimeMS: number,

    // Specifies ideal number of milliseconds between each update.
    // To convert from FPS, use `targetMSPerUpdate = 1000 / FPS`.
    targetMSPerUpdate: number,

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

export function make(): State {
    const graph = Graphs.make(defaultGraphOptions());
    const snowflake = Snowflakes.zero();
    const currentGrowthType = undefined;
    const step = 0;
    const maxSteps = 1000;

    const result: State = {
        graph,
        graphic: undefined,
        snowflake,
        currentGrowthType,
        currentMS: 0,
        currentElapsedMS: 0,
        allotedGrowthTimeMS: 5000,
        targetMSPerUpdate: 1000 / 60,
        playing: false,
        eventQueue: [],
        eventHandlers: undefined,
        eventHandlerTimeout: undefined,
        finishedGrowingCallbacks: [],
        resetCallbacks: [],
    };
    result.eventHandlers = makeEventHandlers(result);
    result.eventHandlerTimeout = setInterval(() => handleEvents(result), result.targetMSPerUpdate)

    return result;
}

export function receiveEvent(state: State, e: StateEvent): void {
    state.eventQueue.push(e);
}

function currentTime(state: State): number {
    return state.currentElapsedMS / state.allotedGrowthTimeMS;
}

export function update(state: State): void {
    const {
        snowflake,
        graph,
        graphic,
        playing,
    } = state;
    const lastMS = state.currentMS;
    const lastElapsedMS = state.currentElapsedMS;
    state.currentMS = performance.now();
    const deltaMS = state.currentMS - lastMS;

    const expectedNumberOfUpdates = state.allotedGrowthTimeMS / state.targetMSPerUpdate;
    const sixtyFPSExpectedNumberOfUpdates = state.allotedGrowthTimeMS / (1000 / 60);
    const fpsScale = sixtyFPSExpectedNumberOfUpdates / expectedNumberOfUpdates;

    const eightSecondsInMS = 8000;
    const timeScale = eightSecondsInMS / state.allotedGrowthTimeMS;

    if (playing) {
        state.currentElapsedMS += deltaMS;

        if (lastElapsedMS < state.allotedGrowthTimeMS
            && state.currentElapsedMS >= state.allotedGrowthTimeMS
        ) {
            state.finishedGrowingCallbacks.forEach(callback => callback());
        } else {
            const thisUpdateGrowthScalar = timeScale * fpsScale * deltaMS / state.targetMSPerUpdate;

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
    }

    const percentDone = state.currentElapsedMS / state.allotedGrowthTimeMS;

    callIfInstalled(graph, i => {
        updateGraph(graph, i);
        i.ctx.clearRect(0, 0, i.canvas.width, i.canvas.height);
        drawGrowthInput(graph, i, percentDone);
    });
}