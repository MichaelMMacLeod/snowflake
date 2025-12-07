import { snowflakeIDString } from "../common/Config.js";
import { yChoices } from "../common/Constants.js";
import { clamp, NonEmptyArray, SnowflakeID } from "../common/Utils.js";
import { Maybe, none, some } from "maybe-either/Maybe";
import * as Maybes from "maybe-either/Maybe";
import { Point } from "../common/Point.js";
import { defaultIsLightTheme } from "./Config.js";

export const _SnowflakeGraph_constants = 0;
export const _SnowflakeGraph_snowflakeID = 1;
export const _SnowflakeGraph_root = 2;
export const _SnowflakeGraph_style = 3;
export const _SnowflakeGraph_g = 4;
export const _SnowflakeGraph_handles = 5;
export const _SnowflakeGraph_handleLine = 6;
export const _SnowflakeGraph_facetingBranchingLine = 7;
export const _SnowflakeGraph_progress = 8;
export const _SnowflakeGraph_handleBeingDragged = 9;
export const _SnowflakeGraph_hoveredHandle = 10;
export const _SnowflakeGraph_handleMovedCallback = 11;
export type SnowflakeGraph = {
    [_SnowflakeGraph_constants]: Constants,
    [_SnowflakeGraph_snowflakeID]: NonEmptyArray<number>,
    [_SnowflakeGraph_root]: SVGSVGElement,
    [_SnowflakeGraph_style]: HTMLStyleElement,
    [_SnowflakeGraph_g]: SVGGElement,
    [_SnowflakeGraph_handles]: Array<GraphHandle>,
    [_SnowflakeGraph_handleLine]: SVGPolylineElement,
    [_SnowflakeGraph_facetingBranchingLine]: SVGLineElement,
    [_SnowflakeGraph_progress]: SVGRectElement,
    [_SnowflakeGraph_handleBeingDragged]: Maybe<number>,
    [_SnowflakeGraph_hoveredHandle]: Maybe<number>,
    [_SnowflakeGraph_handleMovedCallback]: (snowflakeID: SnowflakeID) => void,
};

type Attributes = { [key: string]: string };

const _Constants_aspectRatio = 0;
const _Constants_sizeScalar = 1;
const _Constants_viewportWidth = 2;
const _Constants_viewportHeight = 3;
const _Constants_handleOuterHoverScale = 4;
const _Constants_handleOuterSize = 5;
const _Constants_handleOuterHoveredSize = 6;
const _Constants_handleInnerSize = 7;
const _Constants_lineWidth = 8;
const _Constants_marginWidth = 9;
const _Constants_marginHeight = 10;
const _Constants_graphableViewportWidth = 11;
const _Constants_graphableViewportHeight = 12;
const _Constants_rootStyle = 13;
const _Constants_rootAttrs = 14;
const _Constants_handleInsideAttrs = 15;
const _Constants_handleOutsideAttrs = 16;
const _Constants_facetingBranchingLineAttrs = 17;
const _Constants_handleLineAttrs = 18;
const _Constants_progressAttrs = 19;
type Constants = {
    [_Constants_aspectRatio]: number,
    [_Constants_sizeScalar]: number,
    [_Constants_viewportWidth]: number,
    [_Constants_viewportHeight]: number,
    [_Constants_handleOuterHoverScale]: number,
    [_Constants_handleOuterSize]: number,
    [_Constants_handleOuterHoveredSize]: number,
    [_Constants_handleInnerSize]: number,
    [_Constants_lineWidth]: number,
    [_Constants_marginWidth]: number,
    [_Constants_marginHeight]: number,
    [_Constants_graphableViewportWidth]: number,
    [_Constants_graphableViewportHeight]: number,
    [_Constants_rootStyle]: string,
    [_Constants_rootAttrs]: Attributes,
    [_Constants_handleInsideAttrs]: Attributes,
    [_Constants_handleOutsideAttrs]: Attributes,
    [_Constants_facetingBranchingLineAttrs]: Attributes,
    [_Constants_handleLineAttrs]: Attributes,
    [_Constants_progressAttrs]: Attributes,
};

const SVG_NS = 'http://www.w3.org/2000/svg';

const makeConstants = (sizeScalar: number, aspectRatio: number, isLightTheme: boolean): Constants => {
    const viewportHeight = 200;
    const viewportWidth = aspectRatio * viewportHeight;
    const handleOuterHoverScale = 1.5;
    const handleOuterSize = sizeScalar * 15;
    const handleOuterHoveredSize = handleOuterSize * handleOuterHoverScale;
    const handleInnerSize = sizeScalar * 10;
    const lineWidth = sizeScalar * 5;
    const marginWidth = handleOuterHoveredSize + lineWidth;
    const marginHeight = handleOuterHoveredSize + lineWidth;
    const graphableViewportWidth = viewportWidth - marginWidth * 2;
    const graphableViewportHeight = viewportHeight - marginHeight * 2;

    const rootAttrs = {
        'viewBox': `0 0 ${viewportWidth} ${viewportHeight}`,
        'xmlns': `${SVG_NS}`,
        'width': '100%',
    };

    const { background, foreground } = (() => {
        if (isLightTheme) {
            return {
                background: '#ffffff',
                foreground: '#000000',
            };
        }
        return {
            background: '#000000',
            foreground: '#ffffff',
        };
    })();

    const rootStyle = `
svg * {
  --SFG-color-background: ${background};
  --SFG-color-foreground: ${foreground};
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
@media (prefers-reduced-motion: reduce) {
  .sf-graph-handle-outside {
    transition: scale 0s;
  }
}
.sf-graph-handle-outside:focus:not(:focus-visisble) {
  outline: none;
}
.sf-graph-handle-outside-hover {
  scale: ${handleOuterHoverScale};
}
.sf-graph-handle-outside:focus-visible {
  scale: ${handleOuterHoverScale};
}
.sf-graph-handle-outside:focus:not(:focus-visible) {
  outline: none;
}
.sf-graph-line {
  stroke: var(--SFG-color-foreground);
}
.sf-graph-progress {
  fill: var(--SFG-color-foreground);
  fill-opacity: 0.075;
}
`;

    const handleInsideAttrs = {
        'class': 'sf-graph-handle-inside',
        'r': `${handleInnerSize}`,
        'cx': '0',
        'cy': '0',
    };

    const handleOutsideAttrs = {
        'class': 'sf-graph-handle-outside',
        'r': `${handleOuterSize}`,
        'fill-opacity': '0',
        'stroke-width': `${lineWidth}`,
        'cx': '0',
        'cy': '0',
        'tabindex': '0',
    };

    const facetingBranchingLineY = `${marginHeight + graphableViewportHeight / 2}`;
    const facetingBranchingLineAttrs = {
        'class': 'sf-graph-line',
        'y1': facetingBranchingLineY,
        'y2': facetingBranchingLineY,
        'x1': `${marginWidth}`,
        'x2': `${marginWidth + graphableViewportWidth}`,
        'stroke-width': `${lineWidth}`,
        'stroke-dasharray': '5,5',
        'fill': 'none',
    };

    const handleLineAttrs = {
        'class': 'sf-graph-line',
        'stroke-width': `${lineWidth}`,
        'fill': 'none',
    };

    const progressAttrs = {
        'class': 'sf-graph-progress',
        'x': `${marginWidth}`,
        'y': '0',
        'height': `${viewportHeight}`,
    };

    return [
        aspectRatio,
        sizeScalar,
        viewportWidth,
        viewportHeight,
        handleOuterHoverScale,
        handleOuterSize,
        handleOuterHoveredSize,
        handleInnerSize,
        lineWidth,
        marginWidth,
        marginHeight,
        graphableViewportWidth,
        graphableViewportHeight,
        rootStyle,
        rootAttrs,
        handleInsideAttrs,
        handleOutsideAttrs,
        facetingBranchingLineAttrs,
        handleLineAttrs,
        progressAttrs,
    ];
}

const setSVGAttributes = (element: SVGElement, attributes: Attributes): void => {
    for (const [k, v] of Object.entries(attributes)) {
        element.setAttribute(k, v);
    }
}

const createSVGElement = <K extends keyof SVGElementTagNameMap>(
    element: K,
    attributes: Attributes
): SVGElementTagNameMap[K] => {
    const svg = document.createElementNS(SVG_NS, element);
    setSVGAttributes(svg, attributes);
    return svg;
}

type GraphHandle = {
    g: SVGGElement,
    inside: SVGCircleElement,
    outside: SVGCircleElement,
};

const handleZero = (cs: Constants): GraphHandle => {
    const g = createSVGElement('g', { 'class': 'sf-graph-handle' });
    const inside = createSVGElement('circle', cs[_Constants_handleInsideAttrs]);
    const outside = createSVGElement('circle', cs[_Constants_handleOutsideAttrs]);
    g.appendChild(inside);
    g.appendChild(outside);
    return {
        g,
        inside,
        outside,
    };
}

const setHandleLocation = (handle: GraphHandle, x: number, y: number): void => {
    const attrs = { 'cx': x.toString(), 'cy': y.toString() };
    setSVGAttributes(handle.inside, attrs);
    setSVGAttributes(handle.outside, attrs);
}

const moveHandleUpwards = (sfg: SnowflakeGraph, h: number): void => {
    sfg[_SnowflakeGraph_snowflakeID][h] = Math.max(0, sfg[_SnowflakeGraph_snowflakeID][h] - 1);
    sfg[_SnowflakeGraph_handleMovedCallback](snowflakeIDString(sfg[_SnowflakeGraph_snowflakeID]));
    syncToSnowflakeID(sfg);
}

const moveHandleDownwards = (sfg: SnowflakeGraph, h: number): void => {
    sfg[_SnowflakeGraph_snowflakeID][h] = Math.min(8, sfg[_SnowflakeGraph_snowflakeID][h] + 1);
    sfg[_SnowflakeGraph_handleMovedCallback](snowflakeIDString(sfg[_SnowflakeGraph_snowflakeID]));
    syncToSnowflakeID(sfg);
}

const moveHandleToNth = (sfg: SnowflakeGraph, h: number, nth: number): void => {
    sfg[_SnowflakeGraph_snowflakeID][h] = Math.max(0, Math.min(8, Math.floor(nth)));
    sfg[_SnowflakeGraph_handleMovedCallback](snowflakeIDString(sfg[_SnowflakeGraph_snowflakeID]));
    syncToSnowflakeID(sfg);
}

const addHandle = (cs: Constants, g: SVGGElement, x: number, y: number, sfg: SnowflakeGraph, nthHandle: number): GraphHandle => {
    const result = handleZero(cs);
    result.outside.addEventListener('keydown', e => {
        switch (e.key) {
            case 'ArrowUp':
                moveHandleUpwards(sfg, nthHandle);
                e.preventDefault();
                break;
            case 'ArrowDown':
                moveHandleDownwards(sfg, nthHandle);
                e.preventDefault();
                break;
            default:
                const index = ['1', '2', '3', '4', '5', '6', '7', '8', '9']
                    .findIndex((v, i) => v === e.key);
                if (index !== -1) {
                    moveHandleToNth(sfg, nthHandle, index);
                    e.preventDefault();
                }
                break;
        }
    });
    setHandleLocation(result, x, y);
    g.appendChild(result.g);
    g.appendChild(result.g);
    return result;
}

const createFacetingBranchingLine = (cs: Constants, g: SVGGElement): SVGLineElement => {
    const result = createSVGElement('line', cs[_Constants_facetingBranchingLineAttrs]);;
    g.appendChild(result);
    return result;
}

const createHandleLine = (cs: Constants, g: SVGGElement): SVGPolylineElement => {
    const result = createSVGElement('polyline', cs[_Constants_handleLineAttrs]);;
    g.appendChild(result);
    return result;
}

const fitHandleLineToHandles = (line: SVGPolylineElement, handles: Array<GraphHandle>): void => {
    const points = handles.map(h => {
        const x = h.inside.getAttribute('cx');
        const y = h.inside.getAttribute('cy');
        return `${x}, ${y}`;
    }).join(' ');
    setSVGAttributes(line, { 'points': points });
}

const createProgress = (cs: Constants, g: SVGGElement): SVGRectElement => {
    const result = createSVGElement('rect', cs[_Constants_progressAttrs]);
    g.appendChild(result);
    return result;
}

const fitProgressToGrowth = (cs: Constants, progress: SVGRectElement, percentGrown: number): void => {
    const width = cs[_Constants_graphableViewportWidth] * percentGrown;
    setSVGAttributes(progress, {
        'width': width.toString(),
        'height': cs[_Constants_viewportHeight].toString(),
    });
}

export const syncToSnowflakeID = (g: SnowflakeGraph): void => {
    const id = g[_SnowflakeGraph_snowflakeID];
    while (g[_SnowflakeGraph_handles].length < id.length) {
        const nthHandle = g[_SnowflakeGraph_handles].length;
        g[_SnowflakeGraph_handles].push(addHandle(g[_SnowflakeGraph_constants], g[_SnowflakeGraph_g], 0, 0, g, nthHandle));
    }
    while (g[_SnowflakeGraph_handles].length > id.length) {
        const h = g[_SnowflakeGraph_handles].pop();
        if (h !== undefined) {
            h.g.remove();
        } else {
            throw new Error('h undefined');
        }
    }
    g[_SnowflakeGraph_handles].forEach((h, i) => {
        const constants = g[_SnowflakeGraph_constants];
        const x0 = constants[_Constants_marginWidth];
        const y0 = constants[_Constants_marginHeight];
        const dx = constants[_Constants_graphableViewportWidth] / (id.length - 1);
        const dy = constants[_Constants_graphableViewportHeight] / (yChoices.length - 1);
        const x = x0 + dx * i;
        const y = y0 + dy * id[i];
        setSVGAttributes(h.inside, { 'cx': x.toString(), 'cy': y.toString() });
        setSVGAttributes(h.outside, { 'cx': x.toString(), 'cy': y.toString() });
    });
    fitHandleLineToHandles(g[_SnowflakeGraph_handleLine], g[_SnowflakeGraph_handles]);
}

export const syncToPercentGrown = (g: SnowflakeGraph, percentGrown: number): void => {
    fitProgressToGrowth(g[_SnowflakeGraph_constants], g[_SnowflakeGraph_progress], percentGrown);
}

const graphHandleCenter = (g: SVGGElement): Point => {
    const r = (g as SVGGraphicsElement).getBBox();
    return {
        x: r.x + r.width * 0.5,
        y: r.y + r.height * 0.5,
    }
}

const distanceToGraphHandle = (g: SVGGElement, p: Point): number => {
    return Math.abs(graphHandleCenter(g).x - p.x);
}

const closestGraphHandle = (g: SnowflakeGraph, ev: MouseEvent): number => {
    const p = viewportToSvgPoint(g, { x: ev.clientX, y: ev.clientY });
    let closest = 0;
    let closestDistance = Infinity;
    g[_SnowflakeGraph_handles].forEach((h, i) => {
        const d = distanceToGraphHandle(h.outside, p);
        if (d < closestDistance) {
            closest = i;
            closestDistance = d;
        }
    });
    return closest;
}

const viewportToSvgPoint = (g: SnowflakeGraph, viewportPoint: Point): DOMPoint => {
    const svgPoint = g[_SnowflakeGraph_root].createSVGPoint();
    svgPoint.x = viewportPoint.x;
    svgPoint.y = viewportPoint.y;
    const ctm = g[_SnowflakeGraph_root].getScreenCTM()?.inverse();
    if (ctm === null) {
        throw new Error('ctm is null');
    }
    return svgPoint.matrixTransform(ctm);
}

const closestYChoice = (g: SnowflakeGraph, viewportPoint: Point): number => {
    const p = viewportToSvgPoint(g, viewportPoint);
    const y = (p.y - g[_SnowflakeGraph_constants][_Constants_marginHeight]) / g[_SnowflakeGraph_constants][_Constants_graphableViewportHeight];
    const i = Math.round(y * (yChoices.length - 1));
    return clamp(i, 0, yChoices.length - 1);
}

const syncToConstants = (g: SnowflakeGraph, cs: Constants) => {
    g[_SnowflakeGraph_constants] = cs;
    g[_SnowflakeGraph_style].textContent = cs[_Constants_rootStyle];
    setSVGAttributes(g[_SnowflakeGraph_root], cs[_Constants_rootAttrs]);
    setSVGAttributes(g[_SnowflakeGraph_facetingBranchingLine], cs[_Constants_facetingBranchingLineAttrs]);
    syncToSnowflakeID(g);
}

const mouseEventIsInsideElement = (ev: MouseEvent, e: Element): boolean => {
    const r = e.getBoundingClientRect();
    const x = ev.clientX;
    const y = ev.clientY;
    return x >= r.left && x <= r.right
        && y >= r.top && y <= r.bottom;
}

export const zero = (): SnowflakeGraph => {
    const constants = makeConstants(0.5, 3, defaultIsLightTheme);
    const snowflakeID: NonEmptyArray<number> = [0, 0];
    const root = document.createElementNS(SVG_NS, 'svg');
    const style = document.createElement('style');
    const g = createSVGElement('g', { 'class': 'sf-graph' });
    const handles: Array<GraphHandle> = [];
    const handleLine = createHandleLine(constants, g);
    const facetingBranchingLine = createFacetingBranchingLine(constants, g);
    const progress = createProgress(constants, g);
    const handleBeingDragged = none;
    const hoveredHandle = none;
    const handleMovedCallback = (snowflakeID: string) => { return; };
    const result: SnowflakeGraph = [
        constants,
        snowflakeID,
        root,
        style,
        g,
        handles,
        handleLine,
        facetingBranchingLine,
        progress,
        handleBeingDragged,
        hoveredHandle,
        handleMovedCallback,
    ];
    root.replaceChildren(); // remove all of root's children.
    style.textContent = constants[_Constants_rootStyle];
    root.appendChild(style);
    const updateHandlePosition = (h: number, ev: MouseEvent) => {
        const p = { x: ev.clientX, y: ev.clientY };
        const yChoice = closestYChoice(result, p);
        let oldYChoice = result[_SnowflakeGraph_snowflakeID][h];
        if (oldYChoice === yChoice) {
            return;
        }
        result[_SnowflakeGraph_snowflakeID][h] = yChoice;
        syncToSnowflakeID(result);
        result[_SnowflakeGraph_handleMovedCallback](snowflakeIDString(result[_SnowflakeGraph_snowflakeID]));
    }
    const handleMouseDown = (ev: MouseEvent): void => {
        const h = closestGraphHandle(result, ev);
        result[_SnowflakeGraph_handleBeingDragged] = some(h);
        updateHandlePosition(h, ev);
    }
    const handleMouseUp = (ev: MouseEvent): void => {
        result[_SnowflakeGraph_handleBeingDragged] = none;
    }
    const handleMouseMove = (ev: MouseEvent): void => {
        const hoverClass = 'sf-graph-handle-outside-hover';
        const removeHoverClass = (handleIdx: number): void => {
            result[_SnowflakeGraph_handles][handleIdx].outside.classList.remove(hoverClass);
        }
        const addHoverClass = (handleIdx: number): void => {
            result[_SnowflakeGraph_handles][handleIdx].outside.classList.add(hoverClass);
        }
        Maybes.map(
            result[_SnowflakeGraph_handleBeingDragged],
            () => {
                if (mouseEventIsInsideElement(ev, result[_SnowflakeGraph_g])) {
                    const handleIdx = closestGraphHandle(result, ev);
                    Maybes.map(
                        result[_SnowflakeGraph_hoveredHandle],
                        () => {
                            result[_SnowflakeGraph_hoveredHandle] = some(handleIdx)
                        },
                        h => {
                            if (h !== handleIdx) {
                                removeHoverClass(h);
                                result[_SnowflakeGraph_hoveredHandle] = some(handleIdx);
                            }
                        }
                    );
                    addHoverClass(handleIdx);
                } else {
                    Maybes.mapSome(
                        result[_SnowflakeGraph_hoveredHandle],
                        h => {
                            removeHoverClass(h);
                            result[_SnowflakeGraph_hoveredHandle] = none;
                        }
                    );
                }
            },
            h => updateHandlePosition(h, ev)
        );
    }
    root.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    result[_SnowflakeGraph_root].appendChild(result[_SnowflakeGraph_g]);
    setSVGAttributes(result[_SnowflakeGraph_root], constants[_Constants_rootAttrs]);
    result[_SnowflakeGraph_handles] = [
        addHandle(constants, g, 0, 0, result, 0),
        addHandle(constants, g, 0, 0, result, 1),
    ];
    fitHandleLineToHandles(result[_SnowflakeGraph_handleLine], result[_SnowflakeGraph_handles]);
    syncToSnowflakeID(result);
    return result;
}

export const setConstants = (g: SnowflakeGraph, aspectRatio: number, isLightTheme: boolean): void => {
    const constants = makeConstants(0.5, aspectRatio, isLightTheme);
    syncToConstants(g, constants);
}