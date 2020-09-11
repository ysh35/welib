export declare type SetPayload<S> = ((state: S) => Partial<S>) | Partial<S>;
export declare type Set<S> = (setter: SetPayload<S>) => any;
export declare type Get<S> = (...p: any[]) => S;
export declare type Actions<S, A extends {
    [key: string]: (...args: any[]) => any;
}> = (set: Set<S>, get: Get<S>) => A;
export declare type Result<S, A extends {
    [key: string]: (...args: any[]) => any;
}> = {
    set: Set<S>;
    get: Get<S>;
    subscribe: (listener: (s: S) => any) => () => any;
} & A;
export default function createStore<S, A extends {
    [key: string]: (...args: any[]) => any;
}>(preloadedState: S, actions?: Actions<S, A>): Result<S, A>;
