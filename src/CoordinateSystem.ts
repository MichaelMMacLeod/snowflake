import { Graphic } from "./Graphic";
import { Point } from "./Point";

// Coordinate system(s):
//
// 1: "World" space. This is two dimensional (x,y) with the origin,
// (0,0), in the center. X values increase towards positive infinity
// to the right and decrease to negative infinity to the left. Y
// values increase towards positive infinity going up and decrease to
// negative infinity going down. Radians refer to the angle that lines
// make with the line starting at (0,0) and extending directly right
// towards positive 'X', counterclockwise. So, for example, a vector
// emerging from the origin and going straight up (towards positive Y)
// would be at pi/2 radians. The part of the world that is visible on
// view is a 2x2 square centered at the origin.
//
// 2: "View" space. This is two dimensional (x,y) with the origin,
// (0,0), in the top left corner. X values increase towards positive
// infinity to the right and decrease to negative infinity to the
// left. Y values increase going *down* towards positive infinity and
// decrease towards negative infinity going *up*.
//
// World space is used for doing all the logical calculations
// necessary to grow the snowflake. All coordinates stored in objects
// are in world space. View space is used to draw the snowflake on
// the View and these coordinates are never saved anywhere.

export function worldToViewTransform(graphic: Graphic, p: Point): Point {
    const w = graphic.sizePX;
    const h = graphic.sizePX;
    // affine transform:
    // |r.x|   |w/2   0   w/2|   |p.x|
    // |r.y| = |0   -h/2  h/2| * |p.y|
    // | 1 |   |0     0    1 |   | 1 |
    const r: Point = {
        x: p.x * w * 0.5 + w * 0.5,
        y: p.y * -h * 0.5 + h * 0.5,
    };
    return r;
}