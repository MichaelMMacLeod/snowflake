import { yChoices } from "./Constants";
import { Point } from "./Point";
import { clamp, convertRGBAToString, fracPart, lerp, NonEmptyArray, RGBA } from "./Utils";


export type GraphOptions = {
    progressColor: RGBA,
    progressLineColor: RGBA,
    backgroundColor: RGBA,
    foregroundColor: RGBA,
};

export type GraphInstallationOptions = {
    /** Mouse up events, which stop the graph handles from being dragged, if
     * received by the canvas itself, annoyingly stops the handle even when the
     * mouse just goes a little bit outside the graph. To fix this, we set the
     * mouse up event listener on a parent node, usually the document itself.
     */
    mouseUpEventListenerElement: Node,

    /** The element that the graph canvas wil be added to as a child */
    canvasParent: Node,

    /** CSS class of graph canvas */
    canvasClassName: string,

    canvasWidth: number,
    canvasHeight: number,
};

export function defaultGraphInstallationOptions(): GraphInstallationOptions {
    return {
        mouseUpEventListenerElement: document,
        canvasParent: document.body,
        canvasClassName: 'graph',
        canvasWidth: 600,
        canvasHeight: 200,
    }
}

export type GraphInstallation = {
    options: GraphInstallationOptions,
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    handleBeingDragged: undefined | number | 'needs lookup',
    mouseRecentlyExitedGraph: boolean,
    graphMouse: undefined | Point,
    graphMargin: number,
    writableGraphWidth: number,
    writableGraphHeight: number,
}

export type Graph = {
    options: GraphOptions,
    growthInput: NonEmptyArray<number>,
    installation: GraphInstallation | undefined,
};

export function callWithInstallation<T, U>(graph: Graph, f: (installation: GraphInstallation) => T, notInstalled: () => U): T | U {
    if (graph.installation === undefined) {
        return notInstalled();
    } else {
        return f(graph.installation);
    }
}

export function callIfInstalled(graph: Graph, f: (installation: GraphInstallation) => any): void {
    callWithInstallation(graph, f, () => { });
}

export function errorWithoutInstallation(graph: Graph, f: (installation: GraphInstallation) => any): void {
    callWithInstallation(graph, f, () => {
        console.error('graph not installed');
    });
}

export function defaultGraphOptions(): GraphOptions {
    return {
        progressColor: { r: 255, g: 255, b: 255, a: 1 },
        progressLineColor: { r: 255, g: 255, b: 255, a: 1 },
        backgroundColor: { r: 0, g: 0, b: 0, a: 1 },
        foregroundColor: { r: 0, g: 0, b: 0, a: 1 },
    }
}

export function randomizeGrowthInput(graph: Graph): void {
    graph.growthInput = createRandomGrowthInput();
}

function createRandomGrowthInput(): NonEmptyArray<number> {
    let result: NonEmptyArray<number> = [0];
    for (let i = 1; i < 16; i++) {
        result[i] = Math.floor(Math.random() * 9);
    }
    result[0] = Math.floor(Math.random() * 4);
    return result;
}

export function make(options: GraphOptions): Graph {
    return {
        options,
        growthInput: createRandomGrowthInput(),
        installation: undefined,
    }
};

export function install(graph: Graph, options: GraphInstallationOptions): void {
    if (graph.installation !== undefined) {
        console.error('attempt to install graph twice');
        return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = options.canvasWidth;
    canvas.height = options.canvasHeight
    canvas.className = options.canvasClassName;
    const ctx = canvas.getContext('2d');
    if (ctx === null) {
        return undefined;
    }
    options.canvasParent.appendChild(canvas);

    const graphMargin = 10;

    graph.installation = {
        options,
        canvas,
        ctx,
        handleBeingDragged: undefined,
        mouseRecentlyExitedGraph: false,
        graphMouse: undefined,
        graphMargin,
        writableGraphWidth: canvas.width - 2 * graphMargin,
        writableGraphHeight: canvas.height,
    };

    canvas.addEventListener('mousemove', e => {
        if (graph.installation !== undefined) {
            graph.installation.graphMouse = { x: e.offsetX, y: e.offsetY };
        }
    });
    canvas.addEventListener('mousedown', e => {
        if (graph.installation !== undefined) {
            graph.installation.handleBeingDragged = 'needs lookup';
        }
    });
    options.mouseUpEventListenerElement.addEventListener('mouseup', e => {
        if (graph.installation !== undefined) {
            graph.installation.handleBeingDragged = undefined;
            graph.installation.graphMouse = undefined;
        }
    });
    canvas.addEventListener('mouseleave', e => {
        if (graph.installation !== undefined) {
            graph.installation.mouseRecentlyExitedGraph = true;
        }
    });
}

export function drawGraphHandle(
    graph: Graph,
    i: GraphInstallation,
    x: number,
    y: number,
    isSelected: boolean,
    isBeingDragged: boolean
): void {
    const oldFillStyle = i.ctx.fillStyle;
    const oldStrokeStyle = i.ctx.strokeStyle;
    const oldLineDash = i.ctx.getLineDash();

    const newStyle = graph.options.foregroundColor;

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

    i.ctx.beginPath();
    i.ctx.arc(x, y, 3, 0, 2 * Math.PI);
    i.ctx.closePath();
    i.ctx.fillStyle = convertRGBAToString(newStyle);
    i.ctx.fill();
    i.ctx.closePath();
    i.ctx.beginPath();
    i.ctx.arc(x, y, outerRingRadius, 0, 2 * Math.PI);
    i.ctx.strokeStyle = convertRGBAToString(newStyle);
    i.ctx.setLineDash(newLineDash);
    i.ctx.stroke();

    i.ctx.fillStyle = oldFillStyle;
    i.ctx.strokeStyle = oldStrokeStyle;
    i.ctx.setLineDash(oldLineDash);
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

export function growthHandlePosition(graph: Graph, inst: GraphInstallation, i: number): Point {
    const { writableGraphWidth, writableGraphHeight, graphMargin } = inst;
    return {
        x: writableGraphWidth / (graph.growthInput.length - 1) * i + graphMargin,
        y: 4 * yChoices[graph.growthInput[i]] * (writableGraphHeight / yChoices.length) + writableGraphHeight * 0.5,
    };
}

export function nearestGrowthHandle(graph: Graph, inst: GraphInstallation, canvasPoint: Point): number {
    let nearestDist = Infinity;
    let nearest = 0;

    for (let i = 0; i < graph.growthInput.length; i += 1) {
        const p = growthHandlePosition(graph, inst, i);
        const dx = p.x - canvasPoint.x;
        const dist = dx * dx;
        if (dist < nearestDist) {
            nearestDist = dist;
            nearest = i;
        }
    }

    return nearest;
}

export function updateGraph(graph: Graph, i: GraphInstallation): void {
    if (i.handleBeingDragged !== undefined || i.mouseRecentlyExitedGraph) {
        i.mouseRecentlyExitedGraph = false;
        const handle: undefined | number | 'needs lookup' = (() => {
            if (i.handleBeingDragged === 'needs lookup' && i.graphMouse !== undefined) {
                return nearestGrowthHandle(graph, i, i.graphMouse);
            } else {
                return i.handleBeingDragged;
            }
        })();

        if (i.handleBeingDragged === 'needs lookup') {
            i.handleBeingDragged = handle;
        }

        if (i.graphMouse !== undefined && handle !== 'needs lookup') {
            const dy = i.writableGraphHeight / yChoices.length;
            const j = Math.floor(i.graphMouse.y / dy);
            if (handle !== undefined) {
                graph.growthInput[handle] = clamp(j, 0, yChoices.length - 1);
            }
        }
    }

    let beingDragged = i.handleBeingDragged !== undefined;
    let userSelectValue = beingDragged ? 'none' : 'auto';
    let setStyle = (e: Element) => e.setAttribute('style', `user-select: ${userSelectValue}`);
    Array.from(document.getElementsByClassName('graphLabel')).forEach(setStyle);
    Array.from(document.getElementsByClassName('control')).forEach(setStyle);
    let controlContainer = document.getElementById('controlContainer');
    if (controlContainer !== null) {
        setStyle(controlContainer);
    }
}

export function drawGrowthInput(graph: Graph, i: GraphInstallation, step: number, maxSteps: number): void {
    const {
        writableGraphWidth,
        writableGraphHeight,
        graphMargin,
    } = i;
    const percentDone = step / maxSteps;

    const old = i.ctx.fillStyle;
    i.ctx.fillStyle = convertRGBAToString(graph.options.progressColor);
    i.ctx.fillRect(
        graphMargin,
        0,
        writableGraphWidth * percentDone,
        writableGraphHeight
    );
    i.ctx.fillStyle = old;
    i.ctx.beginPath();

    {
        const p = growthHandlePosition(graph, i, 0);
        i.ctx.moveTo(p.x, p.y);
    }
    for (let j = 1; j < graph.growthInput.length; j += 1) {
        const p = growthHandlePosition(graph, i, j);
        i.ctx.lineTo(p.x, p.y);
    }
    i.ctx.strokeStyle = convertRGBAToString(graph.options.foregroundColor);
    i.ctx.stroke();

    for (let j = 0; j < graph.growthInput.length; j += 1) {
        const p = growthHandlePosition(graph, i, j);
        if (i.graphMouse !== undefined) {
            const nearest = nearestGrowthHandle(graph, i, i.graphMouse);
            drawGraphHandle(graph, i, p.x, p.y, j === nearest, j === i.handleBeingDragged);
        } else {
            drawGraphHandle(graph, i, p.x, p.y, false, false);
        }
    }

    i.ctx.beginPath();
    const progressX = writableGraphWidth * percentDone + graphMargin;
    i.ctx.moveTo(progressX, 0);
    i.ctx.lineTo(progressX, writableGraphHeight);
    i.ctx.strokeStyle = convertRGBAToString(graph.options.progressLineColor);
    i.ctx.stroke();

    i.ctx.beginPath();
    const xAxisY = writableGraphHeight * 0.5;
    i.ctx.moveTo(graphMargin, xAxisY);
    i.ctx.lineTo(writableGraphWidth + graphMargin, xAxisY);
    i.ctx.strokeStyle = convertRGBAToString(graph.options.foregroundColor);
    i.ctx.setLineDash([2, 2]);
    i.ctx.stroke()
    i.ctx.setLineDash([]);
}
