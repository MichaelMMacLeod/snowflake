import { Direction } from "../snowflake/Direction.js";
import * as Directions from "../snowflake/Direction.js";

export type Point = { x: number, y: number };

export const zero = (): Point => {
  return { x: 0, y: 0 }
};

export const zeroM = (result: Point): void => {
  result.x = 0;
  result.y = 0;
}

export const midpointTN = (n1: number, n2: number, percent: number): number => {
  return n1 * (1 - percent) + n2 * percent;
}

export const rotateX = (x: number, y: number, direction: Direction) => {
  return x * Directions.cosines[direction] - y * Directions.sines[direction];
}

export const rotateY = (x: number, y: number, direction: Direction) => {
  return x * Directions.sines[direction] + y * Directions.cosines[direction];
}