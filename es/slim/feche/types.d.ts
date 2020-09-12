export declare type Method = 'get' | 'post' | 'delete' | 'put' | 'patch' | 'head' | 'options' | 'rpc';
export interface FecheConfig {
    baseURL?: string;
    timeout?: number;
}
export interface FecheOptions extends RequestInit {
    url?: string;
    method?: Method;
    timeout?: number;
    getResponse?: true;
    abortController?: AbortController;
}
export declare type FecheInstanceOptions = Omit<FecheOptions, 'getResponse'> & {
    url: string;
    method: Method;
    getResponse: boolean;
};
export declare type FecheResponse<D = unknown> = Response & {
    data?: D;
    fecheOptions: FecheInstanceOptions;
};
export declare type FecheError<D = unknown> = Error & {
    isFecheError: boolean;
    response?: FecheResponse<D>;
    isAbortError?: boolean;
    isTimeoutError?: boolean;
};
export declare const _methods: Method[];
export declare const _defaultConfig: {
    baseURL: string;
    timeout: number;
};
export declare const _defaultOptions: {
    method: Method;
    timeout: number;
    getResponse: boolean;
};
