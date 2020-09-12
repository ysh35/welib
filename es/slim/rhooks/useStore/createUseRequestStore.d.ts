export declare type SetPayload<S> = ((state: S) => Partial<S>) | Partial<S>;
export declare type Set<S> = (setter: SetPayload<S>) => any;
export declare type Get<S> = (...p: any[]) => S;
export declare type Actions<S, A extends {
    [key: string]: (...args: any[]) => any;
}> = (set: Set<S>, get: Get<S>) => A;
declare type Service<D, P extends any[]> = (...p: P) => Promise<D>;
declare type S<D> = {
    data: undefined | D;
    loading: boolean;
    error: undefined | Error;
};
export default function createUseRequestStore<D, P extends any[]>(service: Service<D, P>): {
    <R = S<D>>(selector?: (s: S<D>) => R, { equalFun }?: {
        equalFun: (prev: R, next: R) => boolean;
    }): R;
    store: import("../../store").Result<{
        data: D | undefined;
        loading: boolean;
        error: Error | undefined;
    }, {
        fetch(...args: P): Promise<void>;
    }>;
};
export {};
