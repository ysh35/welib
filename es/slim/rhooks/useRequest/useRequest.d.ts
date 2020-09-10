declare type Service<D, P extends any[]> = (...args: P) => Promise<D>;
interface Options<D, P extends any[]> {
    manual?: boolean;
    key?: string;
    initial?: D;
    params?: P;
    refreshInterval?: number;
    onError?: (error: Error) => any;
    onSuccess?: (data: D) => any;
    retryDelay?: number;
    retryOn?: (error: Error) => boolean;
    equalFun?: (a: D, b: D) => boolean;
}
declare type Result<D, P extends any[]> = {
    data: null | D;
    loading: false;
    error: null | Error;
    run: (...args: P) => Promise<D>;
};
declare function useRequest<D, P extends any[] = any[]>(service: Service<D, P>, option?: Options<D, P>): Result<D, P>;
export default useRequest;
