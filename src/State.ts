import { yChoices } from "./Constants";
import { Control } from "./Control";
import * as Controls from "./Control";
import { Graph, growthHandlePosition, growthInput, GrowthType, interpretGrowth } from "./Graph";
import * as Graphs from "./Graph";
import { Graphic } from "./Graphic";
import * as Graphics from "./Graphic";
import { Point } from "./Point";
import { addBranchesToGrowingFaces, addFacesToGrowingBranches, Snowflake } from "./Snowflake";
import * as Snowflakes from "./Snowflake";
import { clamp } from "./Utils";
import * as Branches from "./Branch";
import * as Faces from "./Face";

export type State = {
    graph: Graph,
    graphic: Graphic,
    snowflake: Snowflake,
    currentGrowthType: GrowthType | undefined,
    graphMargin: number,
    writableGraphWidth: number,
    writableGraphHeight: number,
    controls: Control,
    step: number,
    intervalId: undefined | number,
    updateInterval: number,
    maxSteps: number,
};

export function make(): State | undefined {
    const graph = Graphs.make();
    const graphic = Graphics.make();
    if (graph === undefined || graphic === undefined) {
        console.error("Couldn't get drawing context");
        return undefined;
    }
    const snowflake = Snowflakes.zero;
    const currentGrowthType = undefined;
    const graphMargin = 10;
    const writableGraphWidth = graph.canvas.width - 2 * graphMargin;
    const writableGraphHeight = graph.canvas.height;
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
        graphMargin,
        writableGraphWidth,
        writableGraphHeight,
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

function nearestGrowthHandle(state: State, canvasPoint: Point): number {
    const {
        writableGraphWidth,
        writableGraphHeight,
        graphMargin,
    } = state;

    let nearestDist = Infinity;
    let nearest = 0;

    for (let i = 0; i < growthInput.length; i += 1) {
        const p = growthHandlePosition(
            writableGraphWidth,
            writableGraphHeight,
            graphMargin,
            i);
        const dx = p.x - canvasPoint.x;
        const dist = dx * dx;
        if (dist < nearestDist) {
            nearestDist = dist;
            nearest = i;
        }
    }

    return nearest;
}

function updateGraph(state: State): void {
    const { graph, writableGraphHeight } = state;
    if (graph.handleBeingDragged !== undefined || graph.mouseRecentlyExitedGraph) {
        graph.mouseRecentlyExitedGraph = false;
        const handle: undefined | number | 'needs lookup' = (() => {
            if (graph.handleBeingDragged === 'needs lookup' && graph.graphMouse !== undefined) {
                return nearestGrowthHandle(state, graph.graphMouse);
            } else {
                return graph.handleBeingDragged;
            }
        })();

        if (graph.handleBeingDragged === 'needs lookup') {
            graph.handleBeingDragged = handle;
        }

        if (graph.graphMouse !== undefined && handle !== 'needs lookup') {
            const dy = writableGraphHeight / yChoices.length;
            const i = Math.floor(graph.graphMouse.y / dy);
            if (handle !== undefined) {
                growthInput[handle] = clamp(i, 0, yChoices.length - 1);
            }
        }
    }

    let beingDragged = graph.handleBeingDragged !== undefined;
    let userSelectValue = beingDragged ? 'none' : 'auto';
    let setStyle = (e: Element) => e.setAttribute('style', `user-select: ${userSelectValue}`);
    Array.from(document.getElementsByClassName('graphLabel')).forEach(setStyle);
    Array.from(document.getElementsByClassName('control')).forEach(setStyle);
    let controlContainer = document.getElementById('controlContainer');
    if (controlContainer !== null) {
        setStyle(controlContainer);
    }
}

function drawGrowthInput(state: State): void {
    const {
        graph,
        writableGraphWidth,
        writableGraphHeight,
        graphMargin,
        step,
        maxSteps,
    } = state;

    // const dx = writableGraphWidth / (growthInput.length - 1);
    // const dy = writableGraphHeight / yChoices.length;
    const percentDone = step / maxSteps;

    const old = graph.ctx.fillStyle;
    graph.ctx.fillStyle = graph.background;
    graph.ctx.fillRect(
        graphMargin,
        0,
        writableGraphWidth * percentDone,
        writableGraphHeight
    );
    graph.ctx.fillStyle = old;
    graph.ctx.beginPath();

    {
        const p = growthHandlePosition(
            writableGraphWidth,
            writableGraphHeight,
            graphMargin,
            0);
        graph.ctx.moveTo(p.x, p.y);
    }
    for (let i = 1; i < growthInput.length; i += 1) {
        const p = growthHandlePosition(
            writableGraphWidth,
            writableGraphHeight,
            graphMargin,
            i);
        graph.ctx.lineTo(p.x, p.y);
    }
    graph.ctx.strokeStyle = 'black';
    graph.ctx.stroke();

    for (let i = 0; i < growthInput.length; i += 1) {
        const p = growthHandlePosition(
            writableGraphWidth,
            writableGraphHeight,
            graphMargin,
            i);
        if (graph.graphMouse !== undefined) {
            const nearest = nearestGrowthHandle(state, graph.graphMouse);
            Graphs.drawGraphHandle(graph, p.x, p.y, i === nearest, i === graph.handleBeingDragged);
        } else {
            Graphs.drawGraphHandle(graph, p.x, p.y, false, false);
        }
    }

    graph.ctx.beginPath();
    const progressX = writableGraphWidth * percentDone + graphMargin;
    graph.ctx.moveTo(progressX, 0);
    graph.ctx.lineTo(progressX, writableGraphHeight);
    graph.ctx.strokeStyle = 'blue';
    graph.ctx.stroke();

    graph.ctx.beginPath();
    const xAxisY = writableGraphHeight * 0.5;
    graph.ctx.moveTo(graphMargin, xAxisY);
    graph.ctx.lineTo(writableGraphWidth + graphMargin, xAxisY);
    graph.ctx.strokeStyle = 'black';
    graph.ctx.setLineDash([2, 2]);
    graph.ctx.stroke()
    graph.ctx.setLineDash([]);
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

        const growth = interpretGrowth(currentTime(state));

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

        if (state.currentGrowthType === 'branching') {
            snowflake.branches.forEach(b => {
                if (b.growing) {
                    Branches.enlarge(b, growth.scale)
                }
            });
        } else {
            snowflake.faces.forEach(f => {
                if (f.growing) {
                    Faces.enlarge(f, growth.scale)
                }
            });
        }

        Graphics.clear(graphic);
        Snowflakes.draw(graphic, snowflake);
    }

    updateGraph(state);
    graph.ctx.clearRect(0, 0, graph.canvas.width, graph.canvas.height);
    drawGrowthInput(state);
}

export function reset(state: State): void {
    state.snowflake = Snowflakes.zero;
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
