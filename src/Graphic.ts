export type Graphic = {
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
};

export type GraphicOptions = {
    className: string,
    width: number,
    height: number,
}

export function make(options: GraphicOptions): Graphic | undefined {
    const canvas = document.createElement('canvas');
    canvas.width = options.width;
    canvas.height = options.height;
    canvas.className = options.className;
    const ctx = canvas.getContext('2d');
    if (ctx === null) {
        return undefined;
    }
    return { canvas, ctx };
}

export function clear(graphic: Graphic): void {
    graphic.ctx.clearRect(0, 0, graphic.canvas.width, graphic.canvas.height);
}