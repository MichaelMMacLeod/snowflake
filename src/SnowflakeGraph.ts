import { parseSnowflakeID } from "./Config";
import { yChoices } from "./Constants";
import { NonEmptyArray, ok } from "./Utils";
import * as Eithers from "./Either";
import * as Maybes from "./Maybe";

const SVG_NS = 'http://www.w3.org/2000/svg';
const SIZE_SCALAR = 0.5;
const VIEWPORT_WIDTH = 600;
const VIEWPORT_HEIGHT = 200;
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

.sf-graph {
  filter: drop-shadow(0 0 ${10 * SIZE_SCALAR}px var(--SFG-color-foreground));
}
`;

const HANDLE_INSIDE_ATTRS = {
    'class': 'sf-graph-handle-inside',
    'r': `${HANDLE_INNER_SIZE}`,
    'fill': 'black',
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

const LINE_ATTRS = {
    'class': 'sf-graph-line',
    'stroke-width': `${LINE_WIDTH}`,
    'fill': 'none',
};

function setSVGAttributes(element: SVGElement, attributes: { [key: string]: string }): void {
    for (const [k, v] of Object.entries(attributes)) {
        element.setAttribute(k, v);
    }
}

function createSVGElement(element: string, attributes: { [key: string]: string }): SVGElement {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', element);
    setSVGAttributes(svg, attributes);
    return svg;
}

type GraphHandle = {
    g: SVGElement,
    inside: SVGElement,
    outside: SVGElement,
};

function handleZero(): GraphHandle {
    const g = createSVGElement('g', { 'class': 'sf-graph-handle' });
    const inside = createSVGElement('circle', HANDLE_INSIDE_ATTRS);
    const outside = createSVGElement('circle', HANDLE_OUTSIDE_ATTRS);
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

function addHandle(g: SVGElement, x: number, y: number): GraphHandle {
    const result = handleZero();
    setHandleLocation(result, x, y);
    g.appendChild(result.g);
    g.appendChild(result.g);
    return result;
}

function createLine(g: SVGElement): SVGElement {
    const result = createSVGElement('polyline', LINE_ATTRS);;
    g.appendChild(result);
    return result;
}

function fitLineToHandles(line: SVGElement, handles: Array<GraphHandle>): void {
    const points = handles.map(h => {
        const x = h.inside.getAttribute('cx');
        const y = h.inside.getAttribute('cy');
        return `${x}, ${y}`;
    }).join(' ');
    setSVGAttributes(line, { 'points': points });
}

export type SnowflakeGraph = {
    root: SVGElement,
    g: SVGElement,
    handles: Array<GraphHandle>,
    line: SVGElement,
};

export function syncToSnowflakeID(g: SnowflakeGraph, id: NonEmptyArray<number>): void {
    while (g.handles.length < id.length) {
        g.handles.push(addHandle(g.g, 0, 0));
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
        const x0 = MARGIN_WIDTH;
        const y0 = MARGIN_HEIGHT;
        const dx = GRAPHABLE_VIEWPORT_WIDTH / (id.length - 1);
        const dy = GRAPHABLE_VIEWPORT_HEIGHT / (yChoices.length - 1);
        const x = x0 + dx * i;
        const y = y0 + dy * id[i];
        setSVGAttributes(h.inside, { 'cx': x.toString(), 'cy': y.toString() });
        setSVGAttributes(h.outside, { 'cx': x.toString(), 'cy': y.toString() });
    });
    fitLineToHandles(g.line, g.handles);
}

export function zero(): SnowflakeGraph {
    const root = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const style = document.createElement('style');
    style.textContent = ROOT_STYLE;
    root.appendChild(style);
    const g = createSVGElement('g', { 'class': 'sf-graph' });
    const result: SnowflakeGraph = {
        root,
        g,
        handles: [],
        line: createLine(g),
    };
    result.root.appendChild(result.g);
    setSVGAttributes(result.root, ROOT_ATTRS);
    result.handles = [
        addHandle(g, 0, 0),
        addHandle(g, 0, 0),
    ];
    fitLineToHandles(result.line, result.handles);
    syncToSnowflakeID(result, Maybes.expect(ok(parseSnowflakeID("1993245298354729")), 'unable to parse snowflake id'));
    return result;
}