declare type Requester = RequestInit & {
    data?: unknown;
    getResponse?: true;
};
declare type Responses<S> = Response & {
    data?: S;
    input?: RequestInfo;
    init?: Requester;
};
declare type Payload = [input: RequestInfo, init: Requester];
declare type Creator = {
    baseURL?: string;
    requestInterceptors?: Array<[(payload: Payload) => Payload, (err: Error) => Promise<never>]>;
    responseInterceptors?: Array<[
        (payload: Responses<unknown>) => Responses<unknown>,
        (err: Error & {
            response: Responses<unknown>;
        }) => Promise<never> | Promise<Responses<unknown>>
    ]>;
};
export declare function createRequest({ baseURL, requestInterceptors, responseInterceptors, }?: Creator): {
    <D>(input: RequestInfo, init?: (RequestInit & {
        data?: any;
    }) | undefined): Promise<D>;
    <D_1>(input: RequestInfo, init?: (RequestInit & {
        data?: any;
        getResponse?: true | undefined;
    }) | undefined): Promise<Responses<D_1>>;
};
declare const _default: {
    <D>(input: RequestInfo, init?: (RequestInit & {
        data?: any;
    }) | undefined): Promise<D>;
    <D_1>(input: RequestInfo, init?: (RequestInit & {
        data?: any;
        getResponse?: true | undefined;
    }) | undefined): Promise<Responses<D_1>>;
};
export default _default;
