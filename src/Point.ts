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