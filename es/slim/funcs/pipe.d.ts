declare type Func<T extends any[], R> = (...a: T) => R;
declare function pipe(): <R>(a: R) => R;
declare function pipe<F extends Function>(f: F): F;
declare function pipe<A, T extends any[], R>(f1: (a: A) => R, f2: Func<T, A>): Func<T, R>;
declare function pipe<A, B, T extends any[], R>(f1: (b: B) => R, f2: (a: A) => B, f3: Func<T, A>): Func<T, R>;
declare function pipe<A, B, C, T extends any[], R>(f1: (c: C) => R, f2: (b: B) => C, f3: (a: A) => B, f4: Func<T, A>): Func<T, R>;
declare function pipe<R>(f1: (a: any) => R, ...funcs: Function[]): (...args: any[]) => R;
declare function pipe<R>(...funcs: Function[]): (...args: any[]) => R;
export default pipe;
