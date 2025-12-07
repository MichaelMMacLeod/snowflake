import { yChoices, nextSmallestYChoiceIndex, nextLargestYChoiceIndex, nthYChoiceIndex } from "../common/SnowflakeID.js";
import { none, some } from "maybe-either/Maybe";
import * as Maybes from "maybe-either/Maybe";
import { defaultAspectRatio, defaultIsLightTheme, defaultSnowflakeID } from "./Config.js";
import { defaultGraphDarkThemeColor, defaultGraphLightThemeColor } from "../common/ColorScheme.js";
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
const buildViewBoxValue = (aspectRatio) => {
    return '0 0 '
        + (aspectRatio * viewportHeight).toString()
        + ' '
        + viewportHeight.toString();
};
const rootAttrs = {
    'viewBox': buildViewBoxValue(defaultAspectRatio),
    'xmlns': SVG_NS,
    'width': '100%',
};
const propertyColorBackground = '--a';
const propertyColorForeground = '--b';
const classNameGraphHandleInside = 'a';
const classNameGraphHandleOutside = 'b';
const classNameGraphHandleOutsideHover = 'c';
const classNameGraphLine = 'd';
const classNameGraphProgress = 'e';
const classGraphHandleInside = '.' + classNameGraphHandleInside;
const classGraphHandleOutside = '.' + classNameGraphHandleOutside;
const classGraphHandleOutsideHover = '.' + classNameGraphHandleOutsideHover;
const classGraphLine = '.' + classNameGraphLine;
const classGraphProgress = '.' + classNameGraphProgress;
const varColorBackground = 'var(' + propertyColorBackground + ')';
const varColorForeground = 'var(' + propertyColorForeground + ')';
const buildColorStyles = (isLightTheme) => {
    let background = defaultGraphDarkThemeColor;
    let foreground = defaultGraphLightThemeColor;
    if (!isLightTheme) {
        background = defaultGraphLightThemeColor;
        foreground = defaultGraphDarkThemeColor;
    }
    return 'svg *{'
        + propertyColorBackground
        + ':'
        + background
        + ';'
        + propertyColorForeground
        + ':'
        + foreground
        + '}';
};
const styleSvgStar = 'svg *{transform-box:fill-box}';
const styleClassGraphHandleInside = `${classGraphHandleInside}{fill:${varColorForeground}}`;
const styleClassGraphHandleOutside = `${classGraphHandleOutside}{stroke:${varColorForeground};scale:1;transition:scale 0.1s;transform-origin:center}`;
const styleMediaPrefersReducedMotionReduce = `@media (prefers-reduced-motion:reduce){${classGraphHandleOutside}{transition:scale 0s}}`;
const styleClassGraphHandleOutsideHover = `${classGraphHandleOutsideHover}{scale:${handleOuterHoverScale}}`;
const styleClassGraphHandleOutsideFocusVisisble = `${classGraphHandleOutside}:focus-visible{scale:${handleOuterHoverScale}}`;
const styleClassGraphLine = `${classGraphLine}{stroke:${varColorForeground}}`;
const styleClassGraphProgress = `${classGraphProgress}{fill:${varColorForeground};fill-opacity:0.075}`;
const styles = [
    styleSvgStar,
    styleClassGraphHandleInside,
    styleClassGraphHandleOutside,
    styleMediaPrefersReducedMotionReduce,
    styleClassGraphHandleOutsideHover,
    styleClassGraphHandleOutsideFocusVisisble,
    styleClassGraphLine,
    styleClassGraphProgress,
];
const rootStyle = styles.join('');
const handleInsideAttrs = {
    'class': classNameGraphHandleInside,
    'r': `${handleInnerSize}`,
    'cx': '0',
    'cy': '0',
};
const handleOutsideAttrs = {
    'class': classNameGraphHandleOutside,
    'r': `${handleOuterSize}`,
    'fill-opacity': '0',
    'stroke-width': `${lineWidth}`,
    'cx': '0',
    'cy': '0',
    'tabindex': '0',
};
const facetingBranchingLineY = `${marginHeight + graphableViewportHeight / 2}`;
export const calculateGraphableViewportWidth = (aspectRatio) => {
    return (aspectRatio * viewportHeight) - marginWidth * 2;
};
const defaultGraphableViewportWidth = (defaultAspectRatio * viewportHeight) - marginWidth * 2;
const buildFacetingBranchingLineX2Value = (aspectRatio) => {
    return (marginWidth + calculateGraphableViewportWidth(aspectRatio)).toString();
};
const facetingBranchingLineAttrs = {
    'class': classNameGraphLine,
    'y1': facetingBranchingLineY,
    'y2': facetingBranchingLineY,
    'x1': `${marginWidth}`,
    'x2': buildFacetingBranchingLineX2Value(defaultAspectRatio),
    'stroke-width': `${lineWidth}`,
    'stroke-dasharray': '5,5',
    'fill': 'none',
};
const handleLineAttrs = {
    'class': classNameGraphLine,
    'stroke-width': `${lineWidth}`,
    'fill': 'none',
};
const progressAttrs = {
    'class': classNameGraphProgress,
    'x': `${marginWidth}`,
    'y': '0',
    'height': `${viewportHeight}`,
};
const setSVGAttributes = (element, attributes) => {
    for (const [k, v] of Object.entries(attributes)) {
        element.setAttribute(k, v);
    }
};
const createSVGElement = (element, attributes) => {
    const svg = document.createElementNS(SVG_NS, element);
    setSVGAttributes(svg, attributes);
    return svg;
};
const handleZero = () => {
    const g = document.createElementNS(SVG_NS, 'g');
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
const setHandleLocation = (handle, x, y) => {
    const attrs = { 'cx': x.toString(), 'cy': y.toString() };
    setSVGAttributes(handle.inside, attrs);
    setSVGAttributes(handle.outside, attrs);
};
const moveHandleUpwards = (sfg, h, aspectRatio) => {
    sfg[_SnowflakeGraph_snowflakeID][h] = nextSmallestYChoiceIndex(sfg[_SnowflakeGraph_snowflakeID][h]);
    sfg[_SnowflakeGraph_handleMovedCallback](sfg[_SnowflakeGraph_snowflakeID]);
    syncToSnowflakeID(sfg, aspectRatio);
};
const moveHandleDownwards = (sfg, h, aspectRatio) => {
    sfg[_SnowflakeGraph_snowflakeID][h] = nextLargestYChoiceIndex(sfg[_SnowflakeGraph_snowflakeID][h]);
    sfg[_SnowflakeGraph_handleMovedCallback](sfg[_SnowflakeGraph_snowflakeID]);
    syncToSnowflakeID(sfg, aspectRatio);
};
const moveHandleToNth = (sfg, h, nth, aspectRatio) => {
    sfg[_SnowflakeGraph_snowflakeID][h] = nthYChoiceIndex(nth);
    sfg[_SnowflakeGraph_handleMovedCallback](sfg[_SnowflakeGraph_snowflakeID]);
    syncToSnowflakeID(sfg, aspectRatio);
};
const addHandle = (g, x, y, sfg, nthHandle, aspectRatio) => {
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
const createFacetingBranchingLine = (g) => {
    const result = createSVGElement('line', facetingBranchingLineAttrs);
    ;
    g.appendChild(result);
    return result;
};
const createHandleLine = (g) => {
    const result = createSVGElement('polyline', handleLineAttrs);
    ;
    g.appendChild(result);
    return result;
};
const fitHandleLineToHandles = (line, handles) => {
    const points = handles.map(h => {
        const x = h.inside.getAttribute('cx');
        const y = h.inside.getAttribute('cy');
        return `${x}, ${y}`;
    }).join(' ');
    setSVGAttributes(line, { 'points': points });
};
const createProgress = (g) => {
    const result = createSVGElement('rect', progressAttrs);
    g.appendChild(result);
    return result;
};
const fitProgressToGrowth = (progress, aspectRatio, percentGrown) => {
    const width = calculateGraphableViewportWidth(aspectRatio) * percentGrown;
    progress.setAttribute('width', width.toString());
};
export const syncToSnowflakeID = (g, aspectRatio) => {
    const id = g[_SnowflakeGraph_snowflakeID];
    while (g[_SnowflakeGraph_handles].length < id.length) {
        const nthHandle = g[_SnowflakeGraph_handles].length;
        g[_SnowflakeGraph_handles].push(addHandle(g[_SnowflakeGraph_g], 0, 0, g, nthHandle, aspectRatio));
    }
    while (g[_SnowflakeGraph_handles].length > id.length) {
        const h = g[_SnowflakeGraph_handles].pop();
        if (h !== undefined) {
            h.g.remove();
        }
        else {
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
export const syncToPercentGrown = (g, aspectRatio, percentGrown) => {
    fitProgressToGrowth(g[_SnowflakeGraph_progress], aspectRatio, percentGrown);
};
const graphHandleCenter = (g) => {
    const r = g.getBBox();
    return {
        x: r.x + r.width * 0.5,
        y: r.y + r.height * 0.5,
    };
};
const distanceToGraphHandle = (g, p) => {
    return Math.abs(graphHandleCenter(g).x - p.x);
};
const closestGraphHandle = (g, ev) => {
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
const viewportToSvgPoint = (g, viewportPoint) => {
    var _a;
    const svgPoint = g[_SnowflakeGraph_root].createSVGPoint();
    svgPoint.x = viewportPoint.x;
    svgPoint.y = viewportPoint.y;
    const ctm = (_a = g[_SnowflakeGraph_root].getScreenCTM()) === null || _a === void 0 ? void 0 : _a.inverse();
    if (ctm === null) {
        throw new Error('ctm is null');
    }
    return svgPoint.matrixTransform(ctm);
};
const closestYChoice = (g, viewportPoint) => {
    const p = viewportToSvgPoint(g, viewportPoint);
    const y = (p.y - marginHeight) / graphableViewportHeight;
    return nthYChoiceIndex(Math.round(y * (yChoices.length - 1)));
};
const mouseEventIsInsideElement = (ev, e) => {
    const r = e.getBoundingClientRect();
    const x = ev.clientX;
    const y = ev.clientY;
    return x >= r.left && x <= r.right
        && y >= r.top && y <= r.bottom;
};
export const zero = () => {
    const snowflakeID = defaultSnowflakeID;
    const root = document.createElementNS(SVG_NS, 'svg');
    const style = document.createElement('style');
    const g = document.createElementNS(SVG_NS, 'g');
    const handles = [];
    const handleLine = createHandleLine(g);
    const facetingBranchingLine = createFacetingBranchingLine(g);
    const progress = createProgress(g);
    const handleBeingDragged = none;
    const hoveredHandle = none;
    const handleMovedCallback = (snowflakeID) => { return; };
    const colorStylesStyle = document.createElement('style');
    const result = [
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
    const updateHandlePosition = (h, ev) => {
        const p = { x: ev.clientX, y: ev.clientY };
        const yChoice = closestYChoice(result, p);
        let oldYChoice = result[_SnowflakeGraph_snowflakeID][h];
        if (oldYChoice === yChoice) {
            return;
        }
        result[_SnowflakeGraph_snowflakeID][h] = yChoice;
        syncToSnowflakeID(result, defaultAspectRatio);
        result[_SnowflakeGraph_handleMovedCallback](result[_SnowflakeGraph_snowflakeID]);
    };
    const handleMouseDown = (ev) => {
        const h = closestGraphHandle(result, ev);
        result[_SnowflakeGraph_handleBeingDragged] = some(h);
        updateHandlePosition(h, ev);
    };
    const handleMouseUp = (ev) => {
        result[_SnowflakeGraph_handleBeingDragged] = none;
    };
    const handleMouseMove = (ev) => {
        const removeHoverClass = (handleIdx) => {
            result[_SnowflakeGraph_handles][handleIdx].outside.classList.remove(classNameGraphHandleOutsideHover);
        };
        const addHoverClass = (handleIdx) => {
            result[_SnowflakeGraph_handles][handleIdx].outside.classList.add(classNameGraphHandleOutsideHover);
        };
        Maybes.map(result[_SnowflakeGraph_handleBeingDragged], () => {
            if (mouseEventIsInsideElement(ev, result[_SnowflakeGraph_g])) {
                const handleIdx = closestGraphHandle(result, ev);
                Maybes.map(result[_SnowflakeGraph_hoveredHandle], () => {
                    result[_SnowflakeGraph_hoveredHandle] = some(handleIdx);
                }, h => {
                    if (h !== handleIdx) {
                        removeHoverClass(h);
                        result[_SnowflakeGraph_hoveredHandle] = some(handleIdx);
                    }
                });
                addHoverClass(handleIdx);
            }
            else {
                Maybes.mapSome(result[_SnowflakeGraph_hoveredHandle], h => {
                    removeHoverClass(h);
                    result[_SnowflakeGraph_hoveredHandle] = none;
                });
            }
        }, h => updateHandlePosition(h, ev));
    };
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
export const setAspectRatio = (g, aspectRatio) => {
    g[_SnowflakeGraph_root].setAttribute('viewbox', buildViewBoxValue(aspectRatio));
    g[_SnowflakeGraph_facetingBranchingLine].setAttribute('x2', buildFacetingBranchingLineX2Value(aspectRatio));
    syncToSnowflakeID(g, aspectRatio);
};
export const setIsLightTheme = (g, isLightTheme) => {
    g[_SnowflakeGraph_colorStylesStyle].textContent = buildColorStyles(isLightTheme);
};
//# sourceMappingURL=Graph.js.map