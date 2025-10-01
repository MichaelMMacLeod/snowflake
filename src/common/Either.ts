export type Either<L, R> = { v: 0, d: L } | { v: 1, d: R }

export function left<L, R>(value: L): Either<L, R> {
    return { v: 0, d: value }
}

export function right<L, R>(value: R): Either<L, R> {
    return { v: 1, d: value }
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