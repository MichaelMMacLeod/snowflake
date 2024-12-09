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