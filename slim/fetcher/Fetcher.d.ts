export declare const methods: string[];
export declare const contentTypes: string[];
export interface FetcherConfig {
    baseURL?: string;
}
export interface FetcherInit extends RequestInit {
    method?: string;
    url: string;
}
export interface FetcherResponse<D = unknown> extends Response {
    fetcherInit: FetcherInit;
    data?: D;
}
export declare class FetcherError<E = unknown> extends Error {
    isFetcherError: boolean;
    fetcherInit: FetcherInit;
    response?: FetcherResponse<E>;
}
export declare class Fetcher {
    config: FetcherConfig;
    interceptors: {
        request: {
            fulfilled: any;
            rejected?: any;
        }[];
        response: {
            fulfilled: any;
            rejected?: any;
        }[];
    };
    constructor(config: Partial<FetcherConfig>);
    useRequest(fulfilled: (fetcherInit: FetcherInit) => any, rejected?: (res: FetcherError) => any): Fetcher;
    useResponse(fulfilled: (res: FetcherResponse) => any, rejected?: (res: FetcherError) => any): Fetcher;
    fetch<D>(url: string): Promise<D>;
    fetch<D>(fetcherInit: FetcherInit): Promise<D>;
    fetch<D>(fetcherInit: FetcherInit & {
        response: true;
    }): Promise<FetcherResponse<D>>;
    fetch<D>(url: string, fetcherInit?: Omit<FetcherInit, 'url'>): Promise<D>;
    fetch<D>(url: string, fetcherInit?: Omit<FetcherInit & {
        response: true;
    }, 'url'>): Promise<FetcherResponse<D>>;
    get<D>(url: string, fetcherInit?: Omit<FetcherInit, 'url'>): Promise<any>;
    post<D>(url: string, fetcherInit?: Omit<FetcherInit, 'url'>): Promise<any>;
    delete<D>(url: string, fetcherInit?: Omit<FetcherInit, 'url'>): Promise<any>;
    put<D>(url: string, fetcherInit?: Omit<FetcherInit, 'url'>): Promise<any>;
    patch<D>(url: string, fetcherInit?: Omit<FetcherInit, 'url'>): Promise<any>;
    head<D>(url: string, fetcherInit?: Omit<FetcherInit, 'url'>): Promise<any>;
    options<D>(url: string, fetcherInit?: Omit<FetcherInit, 'url'>): Promise<any>;
    rpc<D>(url: string, fetcherInit?: Omit<FetcherInit, 'url'>): Promise<any>;
}
export declare type FetcherInstance = typeof Fetcher.prototype.fetch & Fetcher & {
    create: (config: FetcherConfig) => FetcherInstance;
};
declare const fetcher: FetcherInstance;
export default fetcher;
