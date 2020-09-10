declare type Requester = RequestInit & {
    data?: unknown;
    getResponse?: true;
};
declare type Responses<S> = Response & {
    data?: S;
    input: RequestInfo;
    init: Requester;
};
declare type Payload = [input: RequestInfo, init: Requester];
export declare function createRequest({ baseURL }?: {
    baseURL?: string;
}): {
    <D>(input: RequestInfo, init?: (RequestInit & {
        data?: any;
    }) | undefined): Promise<D>;
    <D_1>(input: RequestInfo, init?: (RequestInit & {
        data?: any;
        getResponse?: true | undefined;
    }) | undefined): Promise<Responses<D_1>>;
    setBaseURL: (url: string) => void;
    useReqMware: (fulfilled: (payload: Payload) => Payload, rejected: (err: Error) => Promise<never>) => void;
    useResMware: (fulfilled: (payload: Responses<unknown>) => Responses<unknown>, rejected: (err: Error & {
        response?: Responses<unknown>;
    }) => Promise<never> | Promise<Responses<unknown>>) => void;
};
declare const _default: {
    <D>(input: RequestInfo, init?: (RequestInit & {
        data?: any;
    }) | undefined): Promise<D>;
    <D_1>(input: RequestInfo, init?: (RequestInit & {
        data?: any;
        getResponse?: true | undefined;
    }) | undefined): Promise<Responses<D_1>>;
    setBaseURL: (url: string) => void;
    useReqMware: (fulfilled: (payload: Payload) => Payload, rejected: (err: Error) => Promise<never>) => void;
    useResMware: (fulfilled: (payload: Responses<unknown>) => Responses<unknown>, rejected: (err: Error & {
        response?: Responses<unknown> | undefined;
    }) => Promise<never> | Promise<Responses<unknown>>) => void;
};
export default _default;
