declare type Service<D, P extends any[]> = (...p: P) => Promise<D>;
export default function createRequestStore<D, P extends any[]>(service: Service<D, P>): import("../store").Result<{
    data: D | undefined;
    loading: boolean;
    error: Error | undefined;
}, {
    fetch(...args: P): Promise<void>;
}>;
export {};
