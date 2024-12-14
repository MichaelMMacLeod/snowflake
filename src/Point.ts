import { Direction } from "./Direction";
import * as Directions from "./Direction";

export type Point = { x: number, y: number };

export function zero(): Point {
  return { x: 0, y: 0 }
};

export function make(x: number, y: number): Point {
  return { x, y };
}

export function copy(p: Point): Point {
  return { x: p.x, y: p.y };
}

export function add(p1: Point, p2: Point): Point {
  return { x: p1.x + p2.x, y: p1.y + p2.y };
}

export function negate(p: Point): Point {
  return { x: -p.x, y: -p.y };
}

export function subtract(p1: Point, p2: Point): Point {
  return add(p1, negate(p2));
}

export function midpoint(p1: Point, p2: Point): Point {
  return {
    x: p1.x + 0.5 * (p2.x - p1.x),
    y: p1.y + 0.5 * (p2.y - p1.y)
  }
}

/** Returns the point that is `percent` between `p1` and `p2`. `percent`
 * should be `>= 0` and `<= 1`.
 */
export function midpointT(p1: Point, p2: Point, percent: number): Point {
  return add(scale(p1, 1 - percent), scale(p2, percent));
}

export function scale(p: Point, scalar: number): Point {
  return { x: scalar * p.x, y: scalar * p.y };
}

export function translate(p: Point, direction: Direction, distance: number): Point {
  return {
    x: p.x + distance * Math.cos(Directions.values[direction]),
    y: p.y + distance * Math.sin(Directions.values[direction]),
  }
}

// Rotates 'point' by 'theta' around (0,0) counterclockwise.
export function rotate(point: Point, theta: number): Point {
  return {
    x: point.x * Math.cos(theta) - point.y * Math.sin(theta),
    y: point.x * Math.sin(theta) + point.y * Math.cos(theta),
  };
}

export function rotateX(x: number, y: number, theta: number) {
  return x * Math.cos(theta) - y * Math.sin(theta);
}

export function rotateY(x: number, y: number, theta: number) {
  return x * Math.sin(theta) + y * Math.cos(theta);
}

export function drawLine(ctx: CanvasRenderingContext2D, p1: Point, p2: Point): void {
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.stroke();
}

export function drawSeparateLines(ctx: CanvasRenderingContext2D, points: Array<Point>): void {
  ctx.beginPath();
  for (let i = 1; i < points.length; i += 2) {
    const p0 = points[i - 1];
    const p1 = points[i];
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
  }
  ctx.stroke();
}