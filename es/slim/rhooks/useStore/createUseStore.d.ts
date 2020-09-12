export declare type SetPayload<S> = ((state: S) => Partial<S>) | Partial<S>;
export declare type Set<S> = (setter: SetPayload<S>) => any;
export declare type Get<S> = (...p: any[]) => S;
export declare type Actions<S, A extends {
    [key: string]: (...args: any[]) => any;
}> = (set: Set<S>, get: Get<S>) => A;
export default function createUseStore<S, A extends {
    [key: string]: (...args: any[]) => any;
}>(preloadedState: S, actions?: Actions<S, A>): {
    <R = S>(selector?: (s: S) => R, { equalFun }?: {
        equalFun: (prev: R, next: R) => boolean;
    }): R;
    store: import("../../store").Result<S, A>;
};
