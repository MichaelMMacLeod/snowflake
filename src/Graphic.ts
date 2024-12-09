export type Graphic = {
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
};

export function make(): Graphic | undefined {
    const canvas = document.getElementById('snowflake') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');

    if (ctx === null) {
        return undefined;
    }

    const lightBlue = 'rgba(90, 211, 255, 1.0)';

    ctx.fillStyle = lightBlue;

    return { canvas, ctx };
}

export function clear(graphic: Graphic): void {
    graphic.ctx.clearRect(0, 0, graphic.canvas.width, graphic.canvas.height);
}