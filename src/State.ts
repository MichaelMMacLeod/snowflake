import { yChoices } from "./Constants";
import { Control } from "./Control";
import * as Controls from "./Control";
import { callIfInstalled, defaultGraphInstallationOptions, defaultGraphOptions, drawGrowthInput, errorWithoutInstallation, Graph, GraphInstallation, GraphInstallationOptions, GraphOptions, growthHandlePosition, GrowthType, interpretGrowth, nearestGrowthHandle, randomizeGrowthInput, updateGraph } from "./Graph";
import * as Graphs from "./Graph";
import { Graphic, GraphicOptions } from "./Graphic";
import * as Graphics from "./Graphic";
import { Point } from "./Point";
import { addBranchesToGrowingFaces, addFacesToGrowingBranches, Snowflake } from "./Snowflake";
import * as Snowflakes from "./Snowflake";
import { clamp, convertRGBAToString } from "./Utils";
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

export type StateEvent =
    InstallSnowflakeEvent
    | InstallGraphEvent
    | PlayEvent
    | ResetEvent
    | RandomizeEvent
    | HaltEvent;

export type EventHandlers<Events extends { kind: string }> = {
    [E in Events as E["kind"]]: (data: E) => void
};
export type StateEventHandlers = EventHandlers<StateEvent>;

export type State = {
    graph: Graph,
    graphic: Graphic | undefined,
    snowflake: Snowflake,
    currentGrowthType: GrowthType | undefined,
    playing: boolean,
    step: number,
    eventHandlerTimeout: NodeJS.Timeout | undefined,
    intervalId: undefined | number,
    maxSteps: number,
    eventQueue: Array<StateEvent>,
    eventHandlers: StateEventHandlers | undefined,
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
            state.step = 0;
            state.currentGrowthType = undefined;
            if (state.graphic !== undefined) {
                Graphics.clear(state.graphic);
            }
        },
        randomize: _ => {
            randomizeGrowthInput(state.graph)
        },
        halt: _ => {
            clearInterval(state.eventHandlerTimeout);
            state.graph.installation?.removeEventListeners();
        }
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
    update(state);
    state.eventQueue.forEach(e => handleEvent(state, e));
    state.eventQueue.length = 0;
}

/** @see {isStateOptions} ts-auto-guard:type-guard */
export type StateOptions = {
    /** The snowflake will be added as a child of this element */
    snowflakeInstallationElement: HTMLElement,

    /** The controls will be added as a child of this element. 
     * If `undefined`, the graph and controls will not be 
     * installed, and only the snowflake will be visible.
     */
    controlsInstallationElement: HTMLElement | undefined,

    graphOptions: GraphOptions,
    graphInstallationOptions: GraphInstallationOptions | undefined,
}

export function defaultStateOptions(): StateOptions {
    return {
        snowflakeInstallationElement: document.body,
        controlsInstallationElement: document.body,
        graphOptions: defaultGraphOptions(),
        graphInstallationOptions: defaultGraphInstallationOptions(),
    }
}

export function make(): State {
    const graph = Graphs.make(defaultGraphOptions());
    // if (options.graphInstallationOptions !== undefined) {
    //     Graphs.install(graph, options.graphInstallationOptions);
    // }
    const snowflake = Snowflakes.zero();
    const currentGrowthType = undefined;
    const step = 0;
    const intervalId = undefined;
    const maxSteps = 1000;

    const result: State = {
        graph,
        graphic: undefined,
        snowflake,
        currentGrowthType,
        playing: false,
        step,
        intervalId,
        maxSteps,
        eventQueue: [],
        eventHandlers: undefined,
        eventHandlerTimeout: undefined,
    };
    result.eventHandlers = makeEventHandlers(result);
    result.eventHandlerTimeout = setInterval(() => handleEvents(result), 1000 / 120)

    return result;
}

export function receiveEvent(state: State, e: StateEvent): void {
    state.eventQueue.push(e);
}

function currentTime(state: State): number {
    const { step, maxSteps } = state;
    return step / maxSteps;
}

export function update(state: State): void {
    const {
        snowflake,
        graph,
        graphic,
        maxSteps,
        playing,
    } = state;
    if (state.step < maxSteps && playing) {
        state.step += 1;

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

        const sides = Snowflakes.normalizedSides(snowflake);

        if (state.currentGrowthType === 'branching') {
            Snowflakes.killCoveredBranches(snowflake, sides);
            snowflake.branches.forEach(b => {
                if (b.growing) {
                    Branches.enlarge(b, growth.scale)
                }
            });
        } else {
            Snowflakes.killCoveredFaces(snowflake, sides);
            snowflake.faces.forEach(f => {
                if (f.growing) {
                    Faces.enlarge(f, growth.scale)
                }
            });
        }

        if (graphic !== undefined) {
            Graphics.clear(graphic);
            Snowflakes.draw(graphic, snowflake);
        }
    }

    callIfInstalled(graph, i => {
        updateGraph(graph, i);
        i.ctx.clearRect(0, 0, i.canvas.width, i.canvas.height);
        drawGrowthInput(graph, i, state.step, maxSteps);
    })
}

// export function registerControlsEventListeners(state: State): void {
//     const { controls, graphic } = state;

//     controls.pause.addEventListener('click', e => {
//         controls.playing = !controls.playing;
//         if (controls.playing) {
//             controls.pause.innerHTML = 'pause';
//             graphic.canvas.className = '';
//         } else {
//             controls.pause.innerHTML = 'play';
//             graphic.canvas.className = 'paused';
//         }
//     });

//     controls.reset.addEventListener('click', e => {
//         reset(state);
//     });
// }