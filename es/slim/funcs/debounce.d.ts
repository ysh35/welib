declare type Func<T extends any[], R> = (...a: T) => R;
declare function debounce<T extends any[], R>(func: Func<T, R>, wait?: number, immediate?: boolean): {
    (): any;
    clear(): void;
    flush(): void;
};
export default debounce;
