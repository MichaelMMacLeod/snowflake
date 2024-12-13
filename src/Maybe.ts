export type Maybe<T> = { v: 0 } | { v: 1, d: T }

export function none<T>(): Maybe<T> {
    return { v: 0 };
}

export function some<T>(value: T): Maybe<T> {
    return { v: 1, d: value }
}

export function map<T, U>(
    m: Maybe<T>,
    onNone: () => U,
    onSome: (value: T) => U
): U {
    switch (m.v) {
        case 0:
            return onNone();
        case 1:
            return onSome(m.d);
    }
}

export function mapSome<T, U>(
    m: Maybe<T>,
    onSome: (value: T) => U
): Maybe<U> {
    switch (m.v) {
        case 0:
            return none();
        case 1:
            return some(onSome(m.d));
    }
}

export function then<T>(b: boolean, onTrue: () => T): Maybe<T> {
    if (b) {
        return some(onTrue());
    }
    return none();
}

export function unwrapOr<T>(m: Maybe<T>, onNone: () => T): T {
    return map(m, onNone, v => v);
}