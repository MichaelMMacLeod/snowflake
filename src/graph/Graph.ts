import { snowflakeIDString } from "../common/Config";
import { yChoices } from "../common/Constants";
import { clamp, NonEmptyArray } from "../common/Utils";
import { mapSome, Maybe, none, some } from "../common/Maybe";
import { Point } from "../common/Point";

type Attributes = { [key: string]: string };

type Constants = {
    ASPECT_RATIO: number,
    SIZE_SCALAR: number,
    VIEWPORT_WIDTH: number,
    VIEWPORT_HEIGHT: number,
    HANDLE_OUTER_HOVER_SCALE: number,
    HANDLE_OUTER_SIZE: number,
    HANDLE_OUTER_HOVERED_SIZE: number,
    HANDLE_INNER_SIZE: number,
    LINE_WIDTH: number,
    MARGIN_WIDTH: number,
    MARGIN_HEIGHT: number,
    GRAPHABLE_VIEWPORT_WIDTH: number,
    GRAPHABLE_VIEWPORT_HEIGHT: number,
    ROOT_STYLE: string,
    ROOT_ATTRS: Attributes,
    HANDLE_INSIDE_ATTRS: Attributes,
    HANDLE_OUTSIDE_ATTRS: Attributes,
    FACETING_BRANCHING_LINE_ATTRS: Attributes,
    HANDLE_LINE_ATTRS: Attributes,
    PROGRESS_ATTRS: Attributes,
};

const SVG_NS = 'http://www.w3.org/2000/svg';

function makeConstants(SIZE_SCALAR: number, ASPECT_RATIO: number): Constants {
    const VIEWPORT_HEIGHT = 200;
    const VIEWPORT_WIDTH = ASPECT_RATIO * VIEWPORT_HEIGHT;
    const HANDLE_OUTER_HOVER_SCALE = 1.5;
    const HANDLE_OUTER_SIZE = SIZE_SCALAR * 15;
    const HANDLE_OUTER_HOVERED_SIZE = HANDLE_OUTER_SIZE * HANDLE_OUTER_HOVER_SCALE;
    const HANDLE_INNER_SIZE = SIZE_SCALAR * 10;
    const LINE_WIDTH = SIZE_SCALAR * 5;
    const MARGIN_WIDTH = HANDLE_OUTER_HOVERED_SIZE * 2;
    const MARGIN_HEIGHT = HANDLE_OUTER_HOVERED_SIZE * 2;
    const GRAPHABLE_VIEWPORT_WIDTH = VIEWPORT_WIDTH - MARGIN_WIDTH * 2;
    const GRAPHABLE_VIEWPORT_HEIGHT = VIEWPORT_HEIGHT - MARGIN_HEIGHT * 2;

    const ROOT_ATTRS = {
        'viewBox': `0 0 ${VIEWPORT_WIDTH} ${VIEWPORT_HEIGHT}`,
        'xmlns': `${SVG_NS}`,
        'width': '60em',
        'height': '20em',
    };

    const ROOT_STYLE = `
    @media (prefers-color-scheme: dark) {
      svg * {
        --SFG-color-background: #111111;
        --SFG-color-foreground: #ffffff;
      }
    }
    
    @media (prefers-color-scheme: light) {
      svg * {
        --SFG-color-background: #ffffff;
        --SFG-color-foreground: #000000;
      }
    }
    
    svg * {
      transform-box: fill-box;
    }
    
    .sf-graph-handle-inside {
      fill: var(--SFG-color-foreground);
    }
    
    .sf-graph-handle-outside {
      stroke: var(--SFG-color-foreground);
    }
    
    .sf-graph-handle-outside {
      scale: 1;
      transition: scale 0.1s;
      transform-origin: center;
    }
    
    .sf-graph-handle-outside:hover {
      scale: ${HANDLE_OUTER_HOVER_SCALE};
    }
    
    .sf-graph-line {
      stroke: var(--SFG-color-foreground);
    }
    
    .sf-graph-progress {
      fill: var(--SFG-color-foreground);
      fill-opacity: 0.1;
    }
    
    .sf-graph {
      filter: drop-shadow(0 0 ${10 * SIZE_SCALAR}px var(--SFG-color-foreground));
    }
    `;

    const HANDLE_INSIDE_ATTRS = {
        'class': 'sf-graph-handle-inside',
        'r': `${HANDLE_INNER_SIZE}`,
        'cx': '0',
        'cy': '0',
    };

    const HANDLE_OUTSIDE_ATTRS = {
        'class': 'sf-graph-handle-outside',
        'r': `${HANDLE_OUTER_SIZE}`,
        'fill-opacity': '0',
        'stroke-width': `${LINE_WIDTH}`,
        'cx': '0',
        'cy': '0',
    };

    const facetingBranchingLineY = `${MARGIN_HEIGHT + GRAPHABLE_VIEWPORT_HEIGHT / 2}`;
    const FACETING_BRANCHING_LINE_ATTRS = {
        'class': 'sf-graph-line',
        'y1': facetingBranchingLineY,
        'y2': facetingBranchingLineY,
        'x1': `${MARGIN_WIDTH}`,
        'x2': `${MARGIN_WIDTH + GRAPHABLE_VIEWPORT_WIDTH}`,
        'stroke-width': `${LINE_WIDTH}`,
        'stroke-dasharray': '5,5',
        'fill': 'none',
    };

    const HANDLE_LINE_ATTRS = {
        'class': 'sf-graph-line',
        'stroke-width': `${LINE_WIDTH}`,
        'fill': 'none',
    };

    const PROGRESS_ATTRS = {
        'class': 'sf-graph-progress',
        'x': `${MARGIN_WIDTH}`,
        'y': '0',
        'height': `${VIEWPORT_HEIGHT}`,
    };
    return {
        ASPECT_RATIO,
        SIZE_SCALAR,
        VIEWPORT_WIDTH,
        VIEWPORT_HEIGHT,
        HANDLE_OUTER_HOVER_SCALE,
        HANDLE_OUTER_SIZE,
        HANDLE_OUTER_HOVERED_SIZE,
        HANDLE_INNER_SIZE,
        LINE_WIDTH,
        MARGIN_WIDTH,
        MARGIN_HEIGHT,
        GRAPHABLE_VIEWPORT_WIDTH,
        GRAPHABLE_VIEWPORT_HEIGHT,
        ROOT_ATTRS,
        ROOT_STYLE,
        HANDLE_INSIDE_ATTRS,
        HANDLE_OUTSIDE_ATTRS,
        FACETING_BRANCHING_LINE_ATTRS,
        HANDLE_LINE_ATTRS,
        PROGRESS_ATTRS,
    };
}

function setSVGAttributes(element: SVGElement, attributes: Attributes): void {
    for (const [k, v] of Object.entries(attributes)) {
        element.setAttribute(k, v);
    }
}

function createSVGElement(element: string, attributes: Attributes): SVGElement {
    const svg = document.createElementNS(SVG_NS, element);
    setSVGAttributes(svg, attributes);
    return svg;
}

type GraphHandle = {
    g: SVGElement,
    inside: SVGElement,
    outside: SVGElement,
};

function handleZero(cs: Constants): GraphHandle {
    const g = createSVGElement('g', { 'class': 'sf-graph-handle' });
    const inside = createSVGElement('circle', cs.HANDLE_INSIDE_ATTRS);
    const outside = createSVGElement('circle', cs.HANDLE_OUTSIDE_ATTRS);
    g.appendChild(inside);
    g.appendChild(outside);
    return {
        g,
        inside,
        outside,
    };
}

function setHandleLocation(handle: GraphHandle, x: number, y: number): void {
    const attrs = { 'cx': x.toString(), 'cy': y.toString() };
    setSVGAttributes(handle.inside, attrs);
    setSVGAttributes(handle.outside, attrs);
}

function addHandle(cs: Constants, g: SVGElement, x: number, y: number): GraphHandle {
    const result = handleZero(cs);
    setHandleLocation(result, x, y);
    g.appendChild(result.g);
    g.appendChild(result.g);
    return result;
}

function createFacetingBranchingLine(cs: Constants, g: SVGElement): SVGElement {
    const result = createSVGElement('line', cs.FACETING_BRANCHING_LINE_ATTRS);;
    g.appendChild(result);
    return result;
}

function createHandleLine(cs: Constants, g: SVGElement): SVGElement {
    const result = createSVGElement('polyline', cs.HANDLE_LINE_ATTRS);;
    g.appendChild(result);
    return result;
}

function fitHandleLineToHandles(line: SVGElement, handles: Array<GraphHandle>): void {
    const points = handles.map(h => {
        const x = h.inside.getAttribute('cx');
        const y = h.inside.getAttribute('cy');
        return `${x}, ${y}`;
    }).join(' ');
    setSVGAttributes(line, { 'points': points });
}

export type SnowflakeGraph = {
    constants: Constants,
    snowflakeID: NonEmptyArray<number>,
    root: SVGSVGElement,
    style: HTMLStyleElement,
    g: SVGElement,
    handles: Array<GraphHandle>,
    handleLine: SVGElement,
    facetingBranchingLine: SVGElement,
    progress: SVGElement,
    handleBeingDragged: Maybe<number>,
    handleMovedCallback: (snowflakeID: string) => void,
};

function createProgress(cs: Constants, g: SVGElement): SVGElement {
    const result = createSVGElement('rect', cs.PROGRESS_ATTRS);
    g.appendChild(result);
    return result;
}

function fitProgressToGrowth(cs: Constants, progress: SVGElement, percentGrown: number): void {
    const width = cs.GRAPHABLE_VIEWPORT_WIDTH * percentGrown;
    setSVGAttributes(progress, {
        'width': width.toString(),
        'height': cs.VIEWPORT_HEIGHT.toString(),
    });
}

export function syncToSnowflakeID(g: SnowflakeGraph): void {
    const id = g.snowflakeID;
    while (g.handles.length < id.length) {
        g.handles.push(addHandle(g.constants, g.g, 0, 0));
    }
    while (g.handles.length > id.length) {
        const h = g.handles.pop();
        if (h !== undefined) {
            h.g.remove();
        } else {
            throw new Error('h undefined');
        }
    }
    g.handles.forEach((h, i) => {
        const x0 = g.constants.MARGIN_WIDTH;
        const y0 = g.constants.MARGIN_HEIGHT;
        const dx = g.constants.GRAPHABLE_VIEWPORT_WIDTH / (id.length - 1);
        const dy = g.constants.GRAPHABLE_VIEWPORT_HEIGHT / (yChoices.length - 1);
        const x = x0 + dx * i;
        const y = y0 + dy * id[i];
        setSVGAttributes(h.inside, { 'cx': x.toString(), 'cy': y.toString() });
        setSVGAttributes(h.outside, { 'cx': x.toString(), 'cy': y.toString() });
    });
    fitHandleLineToHandles(g.handleLine, g.handles);
}

export function syncToPercentGrown(g: SnowflakeGraph, percentGrown: number): void {
    fitProgressToGrowth(g.constants, g.progress, percentGrown);
}

function graphHandleCenter(g: SVGElement): Point {
    const r = (g as SVGGraphicsElement).getBBox();
    return {
        x: r.x + r.width * 0.5,
        y: r.y + r.height * 0.5,
    }
}

function distanceToGraphHandle(g: SVGElement, p: Point): number {
    return Math.abs(graphHandleCenter(g).x - p.x);
}

function closestGraphHandle(g: SnowflakeGraph, ev: MouseEvent): number {
    const p = viewportToSvgPoint(g, { x: ev.clientX, y: ev.clientY });
    let closest = 0;
    let closestDistance = Infinity;
    g.handles.forEach((h, i) => {
        const d = distanceToGraphHandle(h.outside, p);
        if (d < closestDistance) {
            closest = i;
            closestDistance = d;
        }
    });
    return closest;
}

function viewportToSvgPoint(g: SnowflakeGraph, viewportPoint: Point): DOMPoint {
    const svgPoint = g.root.createSVGPoint();
    svgPoint.x = viewportPoint.x;
    svgPoint.y = viewportPoint.y;
    const ctm = g.root.getScreenCTM()?.inverse();
    if (ctm === null) {
        throw new Error('ctm is null');
    }
    return svgPoint.matrixTransform(ctm);
}

function closestYChoice(g: SnowflakeGraph, viewportPoint: Point): number {
    const p = viewportToSvgPoint(g, viewportPoint);
    const y = (p.y - g.constants.MARGIN_HEIGHT) / g.constants.GRAPHABLE_VIEWPORT_HEIGHT;
    const i = Math.round(y * (yChoices.length - 1));
    return clamp(i, 0, yChoices.length - 1);
}

function syncToConstants(g: SnowflakeGraph, cs: Constants) {
    g.constants = cs;
    g.style.textContent = cs.ROOT_STYLE;
    setSVGAttributes(g.root, cs.ROOT_ATTRS);
    syncToSnowflakeID(g);
}

export function zero(): SnowflakeGraph {
    const root = document.createElementNS(SVG_NS, 'svg');
    const constants = makeConstants(0.5, 3);
    
    root.replaceChildren(); // remove all of root's children.
    const style = document.createElement('style');
    style.textContent = constants.ROOT_STYLE;
    root.appendChild(style);
    const g = createSVGElement('g', { 'class': 'sf-graph' });
    const facetingBranchingLine = createFacetingBranchingLine(constants, g);
    const result: SnowflakeGraph = {
        constants,
        snowflakeID: [0, 0],
        root,
        style,
        g,
        handles: [],
        facetingBranchingLine,
        handleLine: createHandleLine(constants, g),
        progress: createProgress(constants, g),
        handleBeingDragged: none(),
        handleMovedCallback: (snowflakeID: string) => { return; },
    };
    function updateHandlePosition(h: number, ev: MouseEvent) {
        const p = { x: ev.clientX, y: ev.clientY };
        const yChoice = closestYChoice(result, p);
        let oldYChoice = result.snowflakeID[h];
        if (oldYChoice === yChoice) {
            return;
        }
        result.snowflakeID[h] = yChoice;
        syncToSnowflakeID(result);
        result.handleMovedCallback(snowflakeIDString(result.snowflakeID));
    }
    function handleMouseDown(ev: MouseEvent): void {
        const h = closestGraphHandle(result, ev);
        result.handleBeingDragged = some(h);
        updateHandlePosition(h, ev);
    }
    function handleMouseUp(ev: MouseEvent): void {
        result.handleBeingDragged = none();
    }
    function handleMouseMove(ev: MouseEvent): void {
        mapSome(result.handleBeingDragged, h => {
            updateHandlePosition(h, ev);
        });
    }
    root.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    result.root.appendChild(result.g);
    setSVGAttributes(result.root, constants.ROOT_ATTRS);
    result.handles = [
        addHandle(constants, g, 0, 0),
        addHandle(constants, g, 0, 0),
    ];
    fitHandleLineToHandles(result.handleLine, result.handles);
    syncToSnowflakeID(result);
    return result;
}

export function setAspectRatio(g: SnowflakeGraph, aspectRatio: number): void {
    const constants = makeConstants(0.5, aspectRatio);
    syncToConstants(g, constants);
}