import { yChoices } from "./Constants";
import { Control } from "./Control";
import * as Controls from "./Control";
import { callIfInstalled, defaultGraphInstallationOptions, defaultGraphOptions, drawGrowthInput, errorWithoutInstallation, Graph, GraphInstallation, GraphInstallationOptions, GraphOptions, growthHandlePosition, GrowthType, interpretGrowth, nearestGrowthHandle, updateGraph } from "./Graph";
import * as Graphs from "./Graph";
import { Graphic } from "./Graphic";
import * as Graphics from "./Graphic";
import { Point } from "./Point";
import { addBranchesToGrowingFaces, addFacesToGrowingBranches, Snowflake } from "./Snowflake";
import * as Snowflakes from "./Snowflake";
import { clamp, convertRGBAToString } from "./Utils";
import * as Branches from "./Branch";
import * as Faces from "./Face";

export type State = {
    graph: Graph,
    graphic: Graphic,
    snowflake: Snowflake,
    currentGrowthType: GrowthType | undefined,
    controls: Control,
    step: number,
    intervalId: undefined | number,
    updateInterval: number,
    maxSteps: number,
};

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

export function make(options: StateOptions): State | undefined {
    const graph = Graphs.make(options.graphOptions);
    if (options.graphInstallationOptions !== undefined) {
        Graphs.install(graph, options.graphInstallationOptions);
    }
    const graphic = Graphics.make();
    if (graphic === undefined) {
        console.error("Couldn't get drawing context");
        return undefined;
    }
    const snowflake = Snowflakes.zero();
    const currentGrowthType = undefined;
    const controls = Controls.make(graphic);
    const step = 0;
    const intervalId = undefined;
    const updateInterval = 5;
    const maxSteps = 1000;
    return {
        graph,
        graphic,
        snowflake,
        currentGrowthType,
        controls,
        step,
        intervalId,
        updateInterval,
        maxSteps,
    };
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
        controls,
    } = state;
    if (state.step < maxSteps && controls.playing) {
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

        Graphics.clear(graphic);
        Snowflakes.draw(graphic, snowflake);
    }

    callIfInstalled(graph, i => {
        updateGraph(graph, i);
        i.ctx.clearRect(0, 0, i.canvas.width, i.canvas.height);
        drawGrowthInput(graph, i, state.step, maxSteps);
    })
}

export function reset(state: State): void {
    Snowflakes.reset(state.snowflake);
    state.step = 0;
    state.currentGrowthType = undefined;
    Graphics.clear(state.graphic);
}

export function registerControlsEventListeners(state: State): void {
    const { controls, graphic } = state;

    controls.pause.addEventListener('click', e => {
        controls.playing = !controls.playing;
        if (controls.playing) {
            controls.pause.innerHTML = 'pause';
            graphic.canvas.className = '';
        } else {
            controls.pause.innerHTML = 'play';
            graphic.canvas.className = 'paused';
        }
    });

    controls.reset.addEventListener('click', e => {
        reset(state);
    });
}
