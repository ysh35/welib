export declare type RequestConfig = {
    baseURL?: string;
    timeout?: number;
};
export declare type RequestOptions = RequestInit & {
    data?: unknown;
    getResponse?: true;
    timeout?: number;
    abortController?: AbortController;
};
export declare type RequestResponse<S = unknown> = Response & {
    data?: S;
    options: RequestOptions;
};
export declare type RequestError = Error & {
    response?: RequestResponse;
    isAbortError?: boolean;
    isTimeoutError?: boolean;
};
export declare function createRequest(_conf?: Partial<RequestConfig>): {
    <D>(url: string, options?: Pick<RequestOptions, "timeout" | "body" | "cache" | "credentials" | "headers" | "integrity" | "keepalive" | "method" | "mode" | "redirect" | "referrer" | "referrerPolicy" | "signal" | "window" | "data" | "abortController"> | undefined): Promise<D>;
    <D_1>(url: string, options?: (Pick<RequestOptions, "timeout" | "body" | "cache" | "credentials" | "headers" | "integrity" | "keepalive" | "method" | "mode" | "redirect" | "referrer" | "referrerPolicy" | "signal" | "window" | "data" | "abortController"> & {
        getResponse: true;
    }) | undefined): Promise<RequestResponse<D_1>>;
    config: (_conf?: Partial<RequestConfig>) => void;
    useReqMware: (fulfilled: (request: [url: string, options: RequestOptions]) => [url: string, options: RequestOptions], rejected: (err: Error) => Promise<never>) => void;
    useResMware: (fulfilled: (response: RequestResponse) => RequestResponse, rejected: (err: Error & {
        response?: RequestResponse;
    }) => Promise<never> | Promise<RequestResponse>) => void;
};
declare const _default: {
    <D>(url: string, options?: Pick<RequestOptions, "timeout" | "body" | "cache" | "credentials" | "headers" | "integrity" | "keepalive" | "method" | "mode" | "redirect" | "referrer" | "referrerPolicy" | "signal" | "window" | "data" | "abortController"> | undefined): Promise<D>;
    <D_1>(url: string, options?: (Pick<RequestOptions, "timeout" | "body" | "cache" | "credentials" | "headers" | "integrity" | "keepalive" | "method" | "mode" | "redirect" | "referrer" | "referrerPolicy" | "signal" | "window" | "data" | "abortController"> & {
        getResponse: true;
    }) | undefined): Promise<RequestResponse<D_1>>;
    config: (_conf?: Partial<RequestConfig>) => void;
    useReqMware: (fulfilled: (request: [url: string, options: RequestOptions]) => [url: string, options: RequestOptions], rejected: (err: Error) => Promise<never>) => void;
    useResMware: (fulfilled: (response: RequestResponse<unknown>) => RequestResponse<unknown>, rejected: (err: Error & {
        response?: RequestResponse<unknown> | undefined;
    }) => Promise<never> | Promise<RequestResponse<unknown>>) => void;
};
export default _default;
