export type Either<L, R> = { v: 0, d: L } | { v: 1, d: R }

export function left<L, R>(value: L): Either<L, R> {
    return { v: 0, d: value }
}

export function right<L, R>(value: R): Either<L, R> {
    return { v: 1, d: value }
}

export function isLeft<L, R>(e: Either<L, R>): boolean {
    return e.v === 0;
}

export function isRight<L, R>(e: Either<L, R>): boolean {
    return e.v === 1;
}

export function map<L, R, T>(
    e: Either<L, R>,
    onLeft: (value: L) => T,
    onRight: (value: R) => T
): T {
    switch (e.v) {
        case 0:
            return onLeft(e.d);
        case 1:
            return onRight(e.d);
    }
}

export function chain<L, R1, R2>(
    e: Either<L, R1>,
    f: (value: R1) => Either<L, R2>,
): Either<L, R2> {
    switch (e.v) {
        case 0:
            return e;
        case 1:
            return f(e.d);
    }
}