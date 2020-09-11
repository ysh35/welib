declare type Func<T extends any[], R> = (...a: T) => R;
declare function throttle<T extends any[], R>(func: Func<T, R>, limit?: number): () => void;
export default throttle;
