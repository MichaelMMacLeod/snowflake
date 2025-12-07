import { snowflakeIDString } from "../common/Config.js";
import { yChoices } from "../common/Constants.js";
import { clamp, NonEmptyArray, SnowflakeID } from "../common/Utils.js";
import { Maybe, none, some } from "maybe-either/Maybe";
import * as Maybes from "maybe-either/Maybe";
import { Point } from "../common/Point.js";
import { defaultAspectRatio, defaultIsLightTheme } from "./Config.js";
import { defaultDarkThemeColor, defaultGraphDarkThemeColor, defaultGraphLightThemeColor, defaultLightThemeColor } from "../common/ColorScheme.js";

export const _SnowflakeGraph_snowflakeID = 0;
export const _SnowflakeGraph_root = 1;
export const _SnowflakeGraph_style = 2;
export const _SnowflakeGraph_g = 3;
export const _SnowflakeGraph_handles = 4;
export const _SnowflakeGraph_handleLine = 5;
export const _SnowflakeGraph_facetingBranchingLine = 6;
export const _SnowflakeGraph_progress = 7;
export const _SnowflakeGraph_handleBeingDragged = 8;
export const _SnowflakeGraph_hoveredHandle = 9;
export const _SnowflakeGraph_handleMovedCallback = 10;
export const _SnowflakeGraph_colorStylesStyle = 11;

export type SnowflakeGraph = {
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
    [_SnowflakeGraph_colorStylesStyle]: HTMLStyleElement,
};

type Attributes = { [key: string]: string };

const SVG_NS = 'http://www.w3.org/2000/svg';

const sizeScalar = 0.5;
const viewportHeight = 200;
const handleOuterHoverScale = 1.5;
const handleOuterSize = sizeScalar * 15;
const handleOuterHoveredSize = handleOuterSize * handleOuterHoverScale;
const handleInnerSize = sizeScalar * 10;
const lineWidth = sizeScalar * 5;
const marginWidth = handleOuterHoveredSize + lineWidth;
const marginHeight = handleOuterHoveredSize + lineWidth;
const graphableViewportHeight = viewportHeight - marginHeight * 2;

const buildViewBoxValue = (aspectRatio: number): string => {
    return '0 0 '
        + (aspectRatio * viewportHeight).toString()
        + ' '
        + viewportHeight.toString();
};

const rootAttrs: Attributes = {
    'viewBox': buildViewBoxValue(defaultAspectRatio),
    'xmlns': SVG_NS,
    'width': '100%',
};

const buildColorStyles = (isLightTheme: boolean): string => {
    let background = defaultGraphDarkThemeColor;
    let foreground = defaultGraphLightThemeColor;
    if (!isLightTheme) {
        background = defaultGraphLightThemeColor;
        foreground = defaultGraphDarkThemeColor;
    }
    return 'svg *{--SFG-color-background:'
        + background
        + ';--SFG-color-foreground:'
        + foreground
        + '}';
};

const rootStyle = `
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

export const calculateGraphableViewportWidth = (aspectRatio: number): number => {
    return (aspectRatio * viewportHeight) - marginWidth * 2;
};

const defaultGraphableViewportWidth = (defaultAspectRatio * viewportHeight) - marginWidth * 2;

const buildFacetingBranchingLineX2Value = (aspectRatio: number): string => {
    return (marginWidth + calculateGraphableViewportWidth(aspectRatio)).toString();
};

const facetingBranchingLineAttrs = {
    'class': 'sf-graph-line',
    'y1': facetingBranchingLineY,
    'y2': facetingBranchingLineY,
    'x1': `${marginWidth}`,
    'x2': buildFacetingBranchingLineX2Value(defaultGraphableViewportWidth),
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

const setSVGAttributes = (element: SVGElement, attributes: Attributes): void => {
    for (const [k, v] of Object.entries(attributes)) {
        element.setAttribute(k, v);
    }
};

const createSVGElement = <K extends keyof SVGElementTagNameMap>(
    element: K,
    attributes: Attributes
): SVGElementTagNameMap[K] => {
    const svg = document.createElementNS(SVG_NS, element);
    setSVGAttributes(svg, attributes);
    return svg;
};

type GraphHandle = {
    g: SVGGElement,
    inside: SVGCircleElement,
    outside: SVGCircleElement,
};

const handleZero = (): GraphHandle => {
    const g = createSVGElement('g', { 'class': 'sf-graph-handle' });
    const inside = createSVGElement('circle', handleInsideAttrs);
    const outside = createSVGElement('circle', handleOutsideAttrs);
    g.appendChild(inside);
    g.appendChild(outside);
    return {
        g,
        inside,
        outside,
    };
};

const setHandleLocation = (handle: GraphHandle, x: number, y: number): void => {
    const attrs = { 'cx': x.toString(), 'cy': y.toString() };
    setSVGAttributes(handle.inside, attrs);
    setSVGAttributes(handle.outside, attrs);
};

const moveHandleUpwards = (sfg: SnowflakeGraph, h: number, aspectRatio: number): void => {
    sfg[_SnowflakeGraph_snowflakeID][h] = Math.max(0, sfg[_SnowflakeGraph_snowflakeID][h] - 1);
    sfg[_SnowflakeGraph_handleMovedCallback](snowflakeIDString(sfg[_SnowflakeGraph_snowflakeID]));
    syncToSnowflakeID(sfg, aspectRatio);
};

const moveHandleDownwards = (sfg: SnowflakeGraph, h: number, aspectRatio: number): void => {
    sfg[_SnowflakeGraph_snowflakeID][h] = Math.min(8, sfg[_SnowflakeGraph_snowflakeID][h] + 1);
    sfg[_SnowflakeGraph_handleMovedCallback](snowflakeIDString(sfg[_SnowflakeGraph_snowflakeID]));
    syncToSnowflakeID(sfg, aspectRatio);
};

const moveHandleToNth = (sfg: SnowflakeGraph, h: number, nth: number, aspectRatio: number): void => {
    sfg[_SnowflakeGraph_snowflakeID][h] = Math.max(0, Math.min(8, Math.floor(nth)));
    sfg[_SnowflakeGraph_handleMovedCallback](snowflakeIDString(sfg[_SnowflakeGraph_snowflakeID]));
    syncToSnowflakeID(sfg, aspectRatio);
};

const addHandle = (g: SVGGElement, x: number, y: number, sfg: SnowflakeGraph, nthHandle: number, aspectRatio: number): GraphHandle => {
    const result = handleZero();
    result.outside.addEventListener('keydown', e => {
        switch (e.key) {
            case 'ArrowUp':
                moveHandleUpwards(sfg, nthHandle, aspectRatio);
                e.preventDefault();
                break;
            case 'ArrowDown':
                moveHandleDownwards(sfg, nthHandle, aspectRatio);
                e.preventDefault();
                break;
            default:
                const index = ['1', '2', '3', '4', '5', '6', '7', '8', '9']
                    .findIndex((v, i) => v === e.key);
                if (index !== -1) {
                    moveHandleToNth(sfg, nthHandle, index, aspectRatio);
                    e.preventDefault();
                }
                break;
        }
    });
    setHandleLocation(result, x, y);
    g.appendChild(result.g);
    g.appendChild(result.g);
    return result;
};

const createFacetingBranchingLine = (g: SVGGElement): SVGLineElement => {
    const result = createSVGElement('line', facetingBranchingLineAttrs);;
    g.appendChild(result);
    return result;
};

const createHandleLine = (g: SVGGElement): SVGPolylineElement => {
    const result = createSVGElement('polyline', handleLineAttrs);;
    g.appendChild(result);
    return result;
};

const fitHandleLineToHandles = (line: SVGPolylineElement, handles: Array<GraphHandle>): void => {
    const points = handles.map(h => {
        const x = h.inside.getAttribute('cx');
        const y = h.inside.getAttribute('cy');
        return `${x}, ${y}`;
    }).join(' ');
    setSVGAttributes(line, { 'points': points });
};

const createProgress = (g: SVGGElement): SVGRectElement => {
    const result = createSVGElement('rect', progressAttrs);
    g.appendChild(result);
    return result;
};

const fitProgressToGrowth = (progress: SVGRectElement, aspectRatio: number, percentGrown: number): void => {
    const width = calculateGraphableViewportWidth(aspectRatio) * percentGrown;
    progress.setAttribute('width', width.toString());
};

export const syncToSnowflakeID = (g: SnowflakeGraph, aspectRatio: number): void => {
    const id = g[_SnowflakeGraph_snowflakeID];
    while (g[_SnowflakeGraph_handles].length < id.length) {
        const nthHandle = g[_SnowflakeGraph_handles].length;
        g[_SnowflakeGraph_handles].push(addHandle(g[_SnowflakeGraph_g], 0, 0, g, nthHandle, aspectRatio));
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
        const x0 = marginWidth;
        const y0 = marginHeight;
        const dx = calculateGraphableViewportWidth(aspectRatio) / (id.length - 1);
        const dy = graphableViewportHeight / (yChoices.length - 1);
        const x = x0 + dx * i;
        const y = y0 + dy * id[i];
        const inside = h.inside;
        inside.setAttribute('cx', x.toString());
        inside.setAttribute('cy', y.toString());
        const outside = h.outside;
        outside.setAttribute('cx', x.toString());
        outside.setAttribute('cy', y.toString());
    });
    fitHandleLineToHandles(g[_SnowflakeGraph_handleLine], g[_SnowflakeGraph_handles]);
};

export const syncToPercentGrown = (g: SnowflakeGraph, aspectRatio: number, percentGrown: number): void => {
    fitProgressToGrowth(g[_SnowflakeGraph_progress], aspectRatio, percentGrown);
};

const graphHandleCenter = (g: SVGGElement): Point => {
    const r = (g as SVGGraphicsElement).getBBox();
    return {
        x: r.x + r.width * 0.5,
        y: r.y + r.height * 0.5,
    }
};

const distanceToGraphHandle = (g: SVGGElement, p: Point): number => {
    return Math.abs(graphHandleCenter(g).x - p.x);
};

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
};

const viewportToSvgPoint = (g: SnowflakeGraph, viewportPoint: Point): DOMPoint => {
    const svgPoint = g[_SnowflakeGraph_root].createSVGPoint();
    svgPoint.x = viewportPoint.x;
    svgPoint.y = viewportPoint.y;
    const ctm = g[_SnowflakeGraph_root].getScreenCTM()?.inverse();
    if (ctm === null) {
        throw new Error('ctm is null');
    }
    return svgPoint.matrixTransform(ctm);
};

const closestYChoice = (g: SnowflakeGraph, viewportPoint: Point): number => {
    const p = viewportToSvgPoint(g, viewportPoint);
    const y = (p.y - marginHeight) / graphableViewportHeight;
    const i = Math.round(y * (yChoices.length - 1));
    return clamp(i, 0, yChoices.length - 1);
};

const mouseEventIsInsideElement = (ev: MouseEvent, e: Element): boolean => {
    const r = e.getBoundingClientRect();
    const x = ev.clientX;
    const y = ev.clientY;
    return x >= r.left && x <= r.right
        && y >= r.top && y <= r.bottom;
}

export const zero = (): SnowflakeGraph => {
    const snowflakeID: NonEmptyArray<number> = [0, 0];
    const root = document.createElementNS(SVG_NS, 'svg');
    const style = document.createElement('style');
    const g = createSVGElement('g', { 'class': 'sf-graph' });
    const handles: Array<GraphHandle> = [];
    const handleLine = createHandleLine(g);
    const facetingBranchingLine = createFacetingBranchingLine(g);
    const progress = createProgress(g);
    const handleBeingDragged = none;
    const hoveredHandle = none;
    const handleMovedCallback = (snowflakeID: string) => { return; };
    const colorStylesStyle = document.createElement('style');
    const result: SnowflakeGraph = [
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
        colorStylesStyle
    ];
    root.replaceChildren(); // remove all of root's children.
    
    style.textContent = rootStyle;
    root.appendChild(style);

    colorStylesStyle.textContent = buildColorStyles(defaultIsLightTheme);
    root.appendChild(colorStylesStyle);

    const updateHandlePosition = (h: number, ev: MouseEvent) => {
        const p = { x: ev.clientX, y: ev.clientY };
        const yChoice = closestYChoice(result, p);
        let oldYChoice = result[_SnowflakeGraph_snowflakeID][h];
        if (oldYChoice === yChoice) {
            return;
        }
        result[_SnowflakeGraph_snowflakeID][h] = yChoice;
        syncToSnowflakeID(result, defaultAspectRatio);
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
    setSVGAttributes(root, rootAttrs);
    result[_SnowflakeGraph_handles] = [
        addHandle(g, 0, 0, result, 0, defaultAspectRatio),
        addHandle(g, 0, 0, result, 1, defaultAspectRatio),
    ];
    fitHandleLineToHandles(result[_SnowflakeGraph_handleLine], result[_SnowflakeGraph_handles]);
    syncToSnowflakeID(result, defaultAspectRatio);
    return result;
};

export const setAspectRatio = (g: SnowflakeGraph, aspectRatio: number) => {
    g[_SnowflakeGraph_root].setAttribute('viewbox', buildViewBoxValue(aspectRatio));
    g[_SnowflakeGraph_facetingBranchingLine].setAttribute('x2', buildFacetingBranchingLineX2Value(aspectRatio));
    syncToSnowflakeID(g, aspectRatio);
};

export const setIsLightTheme = (g: SnowflakeGraph, isLightTheme: boolean) => {
    g[_SnowflakeGraph_colorStylesStyle].textContent = buildColorStyles(isLightTheme);
};