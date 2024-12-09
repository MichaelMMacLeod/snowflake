import { yChoices } from "./Constants";
import { Point } from "./Point";
import { fracPart, lerp, NonEmptyArray } from "./Utils";

type RGBA = `rgba(${number}, ${number}, ${number}, ${number})`;

export type Graph = {
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    handleBeingDragged: undefined | number | 'needs lookup',
    mouseRecentlyExitedGraph: boolean,
    graphMouse: undefined | Point,
    background: RGBA,
    growthInput: NonEmptyArray<number>,
};

export function randomizeGrowthInput(graph: Graph): void {
    graph.growthInput = createRandomGrowthInput();
}

function createRandomGrowthInput(): NonEmptyArray<number> {
    let result: NonEmptyArray<number> = [0];
    for (let i = 0; i < 16; i++) {
        result[i] = Math.floor(Math.random() * 9);
    }
    return result;
}

export function make(): Graph | undefined {
    const canvas = document.getElementById('graph') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');

    if (ctx === null) {
        return undefined;
    }

    const graphMouse = undefined;
    const background: RGBA = `rgba(203, 203, 255, 1)`;
    const result: Graph = {
        canvas,
        ctx,
        handleBeingDragged: undefined,
        mouseRecentlyExitedGraph: false,
        graphMouse,
        background,
        growthInput: createRandomGrowthInput(),
    };

    canvas.addEventListener('mousemove', e => {
        result.graphMouse = { x: e.offsetX, y: e.offsetY };
    });
    canvas.addEventListener('mousedown', e => {
        result.handleBeingDragged = 'needs lookup';
    });
    document.addEventListener('mouseup', e => {
        result.handleBeingDragged = undefined;
        result.graphMouse = undefined;
    });
    canvas.addEventListener('mouseleave', e => {
        result.mouseRecentlyExitedGraph = true;
    });

    return result;
};

export function drawGraphHandle(
    graph: Graph,
    x: number,
    y: number,
    isSelected: boolean,
    isBeingDragged: boolean
): void {
    const oldFillStyle = graph.ctx.fillStyle;
    const oldStrokeStyle = graph.ctx.strokeStyle;
    const oldLineDash = graph.ctx.getLineDash();

    const newStyle = 'black';

    const outerRingRadius = (() => {
        if (isSelected) {
            return 8;
        } else {
            return 5;
        }
    })();

    const newLineDash = (() => {
        if (isBeingDragged) {
            return [2, 2];
        } else {
            return [];
        }
    })();

    graph.ctx.beginPath();
    graph.ctx.arc(x, y, 3, 0, 2 * Math.PI);
    graph.ctx.closePath();
    graph.ctx.fillStyle = newStyle;
    graph.ctx.fill();
    graph.ctx.closePath();
    graph.ctx.beginPath();
    graph.ctx.arc(x, y, outerRingRadius, 0, 2 * Math.PI);
    graph.ctx.strokeStyle = newStyle;
    graph.ctx.setLineDash(newLineDash);
    graph.ctx.stroke();

    graph.ctx.fillStyle = oldFillStyle;
    graph.ctx.strokeStyle = oldStrokeStyle;
    graph.ctx.setLineDash(oldLineDash);
}

export type GrowthType = 'branching' | 'faceting';
export type Growth = { scale: number, growthType: GrowthType };

export function interpretGrowth(graph: Graph, time: number): Growth {
    let s = lerp(0, graph.growthInput.length - 1, time);
    let n = fracPart(s);
    let a = yChoices[graph.growthInput[Math.floor(s)]];
    let b = yChoices[graph.growthInput[Math.ceil(s)]];
    let signedScale = lerp(a, b, n);
    let timeScalar = -0.01 * s + 1;
    return {
        scale: timeScalar * Math.abs(signedScale),
        growthType: signedScale > 0.0 ? 'branching' : 'faceting',
    };
}

export function growthHandlePosition(
    graph: Graph,
    writableGraphWidth: number,
    writableGraphHeight: number,
    graphMargin: number,
    i: number
): Point {
    return {
        x: writableGraphWidth / (graph.growthInput.length - 1) * i + graphMargin,
        y: 4 * yChoices[graph.growthInput[i]] * (writableGraphHeight / yChoices.length) + writableGraphHeight * 0.5,
    };
}
