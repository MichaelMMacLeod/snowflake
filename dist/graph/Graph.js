import { snowflakeIDString } from "../common/Config.js";
import { yChoices } from "../common/Constants.js";
import { clamp } from "../common/Utils.js";
import { none, some } from "maybe-either/Maybe";
import * as Maybes from "maybe-either/Maybe";
const SVG_NS = 'http://www.w3.org/2000/svg';
const makeConstants = (SIZE_SCALAR, ASPECT_RATIO, isLightTheme) => {
    const VIEWPORT_HEIGHT = 200;
    const VIEWPORT_WIDTH = ASPECT_RATIO * VIEWPORT_HEIGHT;
    const HANDLE_OUTER_HOVER_SCALE = 1.5;
    const HANDLE_OUTER_SIZE = SIZE_SCALAR * 15;
    const HANDLE_OUTER_HOVERED_SIZE = HANDLE_OUTER_SIZE * HANDLE_OUTER_HOVER_SCALE;
    const HANDLE_INNER_SIZE = SIZE_SCALAR * 10;
    const LINE_WIDTH = SIZE_SCALAR * 5;
    const MARGIN_WIDTH = HANDLE_OUTER_HOVERED_SIZE + LINE_WIDTH;
    const MARGIN_HEIGHT = HANDLE_OUTER_HOVERED_SIZE + LINE_WIDTH;
    const GRAPHABLE_VIEWPORT_WIDTH = VIEWPORT_WIDTH - MARGIN_WIDTH * 2;
    const GRAPHABLE_VIEWPORT_HEIGHT = VIEWPORT_HEIGHT - MARGIN_HEIGHT * 2;
    const ROOT_ATTRS = {
        'viewBox': `0 0 ${VIEWPORT_WIDTH} ${VIEWPORT_HEIGHT}`,
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
    const ROOT_STYLE = `
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
  scale: ${HANDLE_OUTER_HOVER_SCALE};
}
.sf-graph-handle-outside:focus-visible {
  scale: ${HANDLE_OUTER_HOVER_SCALE};
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
        'tabindex': '0',
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
const handleZero = (cs) => {
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
};
const setHandleLocation = (handle, x, y) => {
    const attrs = { 'cx': x.toString(), 'cy': y.toString() };
    setSVGAttributes(handle.inside, attrs);
    setSVGAttributes(handle.outside, attrs);
};
const moveHandleUpwards = (sfg, h) => {
    sfg.snowflakeID[h] = Math.max(0, sfg.snowflakeID[h] - 1);
    sfg.handleMovedCallback(snowflakeIDString(sfg.snowflakeID));
    syncToSnowflakeID(sfg);
};
const moveHandleDownwards = (sfg, h) => {
    sfg.snowflakeID[h] = Math.min(8, sfg.snowflakeID[h] + 1);
    sfg.handleMovedCallback(snowflakeIDString(sfg.snowflakeID));
    syncToSnowflakeID(sfg);
};
const moveHandleToNth = (sfg, h, nth) => {
    sfg.snowflakeID[h] = Math.max(0, Math.min(8, Math.floor(nth)));
    sfg.handleMovedCallback(snowflakeIDString(sfg.snowflakeID));
    syncToSnowflakeID(sfg);
};
const addHandle = (cs, g, x, y, sfg, nthHandle) => {
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
};
const createFacetingBranchingLine = (cs, g) => {
    const result = createSVGElement('line', cs.FACETING_BRANCHING_LINE_ATTRS);
    ;
    g.appendChild(result);
    return result;
};
const createHandleLine = (cs, g) => {
    const result = createSVGElement('polyline', cs.HANDLE_LINE_ATTRS);
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
const createProgress = (cs, g) => {
    const result = createSVGElement('rect', cs.PROGRESS_ATTRS);
    g.appendChild(result);
    return result;
};
const fitProgressToGrowth = (cs, progress, percentGrown) => {
    const width = cs.GRAPHABLE_VIEWPORT_WIDTH * percentGrown;
    setSVGAttributes(progress, {
        'width': width.toString(),
        'height': cs.VIEWPORT_HEIGHT.toString(),
    });
};
export const syncToSnowflakeID = (g) => {
    const id = g.snowflakeID;
    while (g.handles.length < id.length) {
        const nthHandle = g.handles.length;
        g.handles.push(addHandle(g.constants, g.g, 0, 0, g, nthHandle));
    }
    while (g.handles.length > id.length) {
        const h = g.handles.pop();
        if (h !== undefined) {
            h.g.remove();
        }
        else {
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
};
export const syncToPercentGrown = (g, percentGrown) => {
    fitProgressToGrowth(g.constants, g.progress, percentGrown);
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
    g.handles.forEach((h, i) => {
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
    const svgPoint = g.root.createSVGPoint();
    svgPoint.x = viewportPoint.x;
    svgPoint.y = viewportPoint.y;
    const ctm = (_a = g.root.getScreenCTM()) === null || _a === void 0 ? void 0 : _a.inverse();
    if (ctm === null) {
        throw new Error('ctm is null');
    }
    return svgPoint.matrixTransform(ctm);
};
const closestYChoice = (g, viewportPoint) => {
    const p = viewportToSvgPoint(g, viewportPoint);
    const y = (p.y - g.constants.MARGIN_HEIGHT) / g.constants.GRAPHABLE_VIEWPORT_HEIGHT;
    const i = Math.round(y * (yChoices.length - 1));
    return clamp(i, 0, yChoices.length - 1);
};
const syncToConstants = (g, cs) => {
    g.constants = cs;
    g.style.textContent = cs.ROOT_STYLE;
    setSVGAttributes(g.root, cs.ROOT_ATTRS);
    setSVGAttributes(g.facetingBranchingLine, cs.FACETING_BRANCHING_LINE_ATTRS);
    syncToSnowflakeID(g);
};
const mouseEventIsInsideElement = (ev, e) => {
    const r = e.getBoundingClientRect();
    const x = ev.clientX;
    const y = ev.clientY;
    return x >= r.left && x <= r.right
        && y >= r.top && y <= r.bottom;
};
export const zero = () => {
    const root = document.createElementNS(SVG_NS, 'svg');
    const constants = makeConstants(0.5, 3, false);
    root.replaceChildren(); // remove all of root's children.
    const style = document.createElement('style');
    style.textContent = constants.ROOT_STYLE;
    root.appendChild(style);
    const g = createSVGElement('g', { 'class': 'sf-graph' });
    const facetingBranchingLine = createFacetingBranchingLine(constants, g);
    const result = {
        constants,
        snowflakeID: [0, 0],
        root,
        style,
        g,
        handles: [],
        facetingBranchingLine,
        handleLine: createHandleLine(constants, g),
        progress: createProgress(constants, g),
        handleBeingDragged: none,
        hoveredHandle: none,
        handleMovedCallback: (snowflakeID) => { return; },
    };
    const updateHandlePosition = (h, ev) => {
        const p = { x: ev.clientX, y: ev.clientY };
        const yChoice = closestYChoice(result, p);
        let oldYChoice = result.snowflakeID[h];
        if (oldYChoice === yChoice) {
            return;
        }
        result.snowflakeID[h] = yChoice;
        syncToSnowflakeID(result);
        result.handleMovedCallback(snowflakeIDString(result.snowflakeID));
    };
    const handleMouseDown = (ev) => {
        const h = closestGraphHandle(result, ev);
        result.handleBeingDragged = some(h);
        updateHandlePosition(h, ev);
    };
    const handleMouseUp = (ev) => {
        result.handleBeingDragged = none;
    };
    const handleMouseMove = (ev) => {
        const hoverClass = 'sf-graph-handle-outside-hover';
        const removeHoverClass = (handleIdx) => {
            result.handles[handleIdx].outside.classList.remove(hoverClass);
        };
        const addHoverClass = (handleIdx) => {
            result.handles[handleIdx].outside.classList.add(hoverClass);
        };
        Maybes.map(result.handleBeingDragged, () => {
            if (mouseEventIsInsideElement(ev, result.g)) {
                const handleIdx = closestGraphHandle(result, ev);
                Maybes.map(result.hoveredHandle, () => {
                    result.hoveredHandle = some(handleIdx);
                }, h => {
                    if (h !== handleIdx) {
                        removeHoverClass(h);
                        result.hoveredHandle = some(handleIdx);
                    }
                });
                addHoverClass(handleIdx);
            }
            else {
                Maybes.mapSome(result.hoveredHandle, h => {
                    removeHoverClass(h);
                    result.hoveredHandle = none;
                });
            }
        }, h => updateHandlePosition(h, ev));
    };
    root.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    result.root.appendChild(result.g);
    setSVGAttributes(result.root, constants.ROOT_ATTRS);
    result.handles = [
        addHandle(constants, g, 0, 0, result, 0),
        addHandle(constants, g, 0, 0, result, 1),
    ];
    fitHandleLineToHandles(result.handleLine, result.handles);
    syncToSnowflakeID(result);
    return result;
};
export const setConstants = (g, aspectRatio, isLightTheme) => {
    const constants = makeConstants(0.5, aspectRatio, isLightTheme);
    syncToConstants(g, constants);
};
//# sourceMappingURL=Graph.js.map