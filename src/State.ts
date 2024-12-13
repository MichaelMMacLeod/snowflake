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
import { Graphic } from "./Graphic";
import * as Graphics from "./Graphic";
import { addBranchesToGrowingFaces, addFacesToGrowingBranches, Snowflake } from "./Snowflake";
import * as Snowflakes from "./Snowflake";
import * as Branches from "./Branch";
import * as Faces from "./Face";
import { fracPart, NonEmptyArray, parseSnowflakeId } from "./Utils";
import * as Eithers from "./Either";

export type State = {
    graph: Graph,
    graphic: Graphic | undefined,
    snowflake: Snowflake,
    currentGrowthType: GrowthType | undefined,
    idealMSBetweenUpdates: number,

    upsCap: number,

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
    updateBank: number,

    maxUpdates: number,

    resetStartTime: number,

    playing: boolean,
    finishedGrowingCallback: () => void,
    resetCallback: () => void,
    installSnowflakeCanvasCallback: (canvas: HTMLCanvasElement) => void,
    installSnowflakeCanvasFailureCallback: () => void,
    installGraphCanvasCallback: (canvas: HTMLCanvasElement) => void,
    installGraphCanvasFailureCallback: () => void,
    graphMouseUpEventListenerNode: Node,
};

export function reset(state: State): void {
    Snowflakes.reset(state.snowflake);
    state.currentGrowthType = undefined;
    state.updateBank = 0;
    state.updateCount = 0;
    state.currentMS = performance.now();
    state.resetStartTime = performance.now();
    if (state.graphic !== undefined) {
        Graphics.clear(state.graphic);
    }
    state.resetCallback();
}

export function setSnowflakeCanvasSizePX(state: State, snowflakeCanvasSizePX: number): boolean {
    if (state.graphic === undefined) {
        return false;
    }
    state.graphic.ctx.canvas.width = snowflakeCanvasSizePX;
    state.graphic.ctx.canvas.height = snowflakeCanvasSizePX;
    state.graphic.canvas.style.width = `${snowflakeCanvasSizePX}px`;
    state.graphic.canvas.style.height = `${snowflakeCanvasSizePX}px`;
    return true;
}

export function setSnowflakeId(state: State, snowflakeId: string): void {
    const xs: Array<number> = Eithers.map(parseSnowflakeId(snowflakeId), v => { throw new Error('invalid snowflake ID') }, v => v);
    if (xs.length === 0) {
        throw new Error('parsing snowflake id gave zero length array');
    } else {
        const xsNonempty: NonEmptyArray<number> = xs as any;
        state.graph.growthInput = xsNonempty;
    }
}

export function installSnowflakeCanvas(state: State, snowflakeCanvasSizePX: number): void {
    if (state.graphic !== undefined) {
        throw new Error('snowflake already installed');
    }
    state.graphic = Graphics.make(snowflakeCanvasSizePX);
    if (state.graphic === undefined) {
        state.installSnowflakeCanvasFailureCallback();
    } else {
        state.installSnowflakeCanvasCallback(state.graphic.canvas);
    }
}

export function installGraphCanvas(
    state: State,
    width: number,
    height: number,
    mouseUpEventListenerNode: Node
): void {
    const options: GraphInstallationOptions = {
        mouseUpEventListenerNode,
        canvasWidth: width,
        canvasHeight: height, 
    };
    Graphs.install(state.graph, options);
    if (state.graph.installation === undefined) {
        state.installGraphCanvasFailureCallback();
    } else {
        state.installGraphCanvasCallback(state.graph.installation.canvas);
    }
}

export function setGraphCanvasWidth(state: State, width: number): void {
    if (state.graph.installation === undefined) {
        return;
    }
    state.graph.installation.ctx.canvas.width = width;
    state.graph.installation.canvas.style.width = `${width}px`;
}

export function setGraphCanvasHeight(state: State, height: number): void {
    if (state.graph.installation === undefined) {
        return;
    }
    state.graph.installation.ctx.canvas.height = height;
    state.graph.installation.canvas.style.height = `${height}px`;
}

export function handleEvents(state: State): void {
    if (state.playing) {
        setTimeout(() => requestAnimationFrame(() => handleEvents(state)), 1000 / state.upsCap);
        update(state);
    }
}

export function setIdealMSBetweenUpdates(state: State, targetGrowthTimeMS: number): void {
    state.idealMSBetweenUpdates = Math.max(1000 / state.upsCap, targetGrowthTimeMS / state.maxUpdates);
}

export function make(): State {
    const graph = Graphs.make(defaultGraphOptions());
    const snowflake = Snowflakes.zero();

    // These defaults are overwritten in Controller which synchronizes
    // this state with the default Config. It's the values in the 
    // default Config that matter.
    const result: State = {
        graph,
        graphic: undefined,
        snowflake,
        currentGrowthType: undefined,
        updateBank: 0,
        updateCount: 0,
        currentMS: 0,
        idealMSBetweenUpdates: 0,
        upsCap: Infinity,
        maxUpdates: 500,
        resetStartTime: performance.now(),
        playing: false,
        finishedGrowingCallback: () => { return; },
        resetCallback: () => { return; },
        installSnowflakeCanvasCallback: _ => { return; },
        installSnowflakeCanvasFailureCallback: () => { return; },
        installGraphCanvasCallback: _ => { return; },
        installGraphCanvasFailureCallback: () => { return; },
        graphMouseUpEventListenerNode: document,
    };

    handleEvents(result);

    return result;
}

function currentTime(state: State): number {
    return state.updateCount / state.maxUpdates;
}

export function update(state: State): void {
    const {
        snowflake,
        graph,
        graphic,
        playing,
    } = state;
    const lastMS = state.currentMS;
    state.currentMS = performance.now();
    const deltaMS = state.currentMS - lastMS;

    const desiredMSBetweenUpdates = state.idealMSBetweenUpdates;

    const actualMSBetweenUpdates = deltaMS;

    const remainingUpdates = Math.max(0, state.maxUpdates - state.updateCount);
    let requiredUpdates = Math.min(remainingUpdates, actualMSBetweenUpdates / desiredMSBetweenUpdates);

    if (requiredUpdates < 1) {
        state.currentMS = lastMS;
        return;
    }

    function doUpdate() {
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
                    Branches.enlarge(b, growth.scale)
                }
            });
        } else {
            Snowflakes.killCoveredFaces(snowflake);
            snowflake.faces.forEach(f => {
                if (f.growing) {
                    Faces.enlarge(f, growth.scale)
                }
            });
        }

        if (graphic !== undefined) {
            if (Snowflakes.draw(graphic, snowflake)) {
                state.updateCount = state.maxUpdates;
                state.updateBank = 0;
                let v = window as any;
                if (v.count === undefined) {
                    v.count = 0;
                }
                v.count += 1;
                console.log(`too large count = ${v.count}, ${state.graph.growthInput}`);
            }
        }
    }

    // if (playing) {
    const willUpdateAtLeastOnce = requiredUpdates > 0;

    requiredUpdates += state.updateBank;
    state.updateBank = fracPart(requiredUpdates);
    requiredUpdates = Math.floor(requiredUpdates);

    for (; requiredUpdates > 0; requiredUpdates -= 1) {
        state.updateCount += 1;
        doUpdate();
    }

    if (willUpdateAtLeastOnce && state.updateCount >= state.maxUpdates) {
        state.finishedGrowingCallback();
        // console.log(`Grew snowflake in ${(performance.now() - state.resetStartTime) / 1000} seconds`);
    }
    // }

    const percentDone = state.updateCount / state.maxUpdates;

    callIfInstalled(graph, i => {
        updateGraph(graph, i);
        i.ctx.clearRect(0, 0, i.canvas.width, i.canvas.height);
        drawGrowthInput(graph, i, percentDone);
    });
}