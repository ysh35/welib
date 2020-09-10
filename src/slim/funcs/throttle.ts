type Func<T extends any[], R> = (...a: T) => R;

function throttle<T extends any[], R>(func: Func<T, R>, limit: number = 100) {
  let timer: number;
  let lastRan: number;
  return function () {
    // @ts-ignore
    const context = this;
    const args = (arguments as unknown) as T;
    if (!lastRan) {
      func.apply(context, args);
      lastRan = Date.now();
    } else {
      clearTimeout(timer);
      timer = setTimeout(function () {
        if (Date.now() - lastRan >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
}

export default throttle;
