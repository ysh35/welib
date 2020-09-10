type Func<T extends any[], R> = (...a: T) => R;
function compose(): <R>(a: R) => R;
function compose<F extends Function>(f: F): F;
function compose<A, T extends any[], R>(f1: (a: A) => R, f2: Func<T, A>): Func<T, R>;
function compose<A, B, T extends any[], R>(
  f1: (b: B) => R,
  f2: (a: A) => B,
  f3: Func<T, A>,
): Func<T, R>;
function compose<A, B, C, T extends any[], R>(
  f1: (c: C) => R,
  f2: (b: B) => C,
  f3: (a: A) => B,
  f4: Func<T, A>,
): Func<T, R>;
function compose<R>(f1: (a: any) => R, ...funcs: Function[]): (...args: any[]) => R;

function compose<R>(...funcs: Function[]): (...args: any[]) => R;
function compose(...funcs: Function[]) {
  if (funcs.length === 0) {
    return <T>(arg: T) => arg;
  }

  if (funcs.length === 1) {
    return funcs[0];
  }

  return funcs.reduce((a, b) => (...args: any) => a(b(...args)));
}

export default compose;
