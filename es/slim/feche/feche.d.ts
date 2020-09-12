import { FecheConfig, FecheOptions, FecheInstanceOptions, FecheResponse, FecheError } from './types';
export declare class Feche {
    _config: FecheConfig;
    _interceptors: {
        request: {
            fulfilled: (fecheOptions: FecheInstanceOptions) => FecheInstanceOptions;
            rejected: (error: FecheError) => FecheInstanceOptions | Promise<never>;
        }[];
        response: {
            fulfilled: (response: FecheResponse) => FecheResponse;
            rejected: (error: FecheError) => FecheResponse | Promise<never>;
        }[];
    };
    constructor(config?: Partial<FecheConfig>);
    config(config?: Partial<FecheConfig>): void;
    useRequest(fulfilled: (fecheOptions: FecheInstanceOptions) => FecheInstanceOptions, rejected: (error: FecheError) => FecheInstanceOptions | Promise<never>): Feche;
    useResponse(fulfilled: (response: FecheResponse) => FecheResponse, rejected: (error: FecheError) => FecheResponse | Promise<never>): Feche;
    feche<D>(url: string, options: Omit<FecheOptions, 'getResponse'> & {
        getResponse: true;
    }): Promise<FecheResponse<D>>;
    feche<D>(url: string, options?: Omit<FecheOptions, 'getResponse'>): Promise<D>;
}
export declare type FecheInstance = typeof Feche.prototype.feche & Feche & {
    create: (config?: FecheConfig) => FecheInstance;
    get: typeof Feche.prototype.feche;
    post: typeof Feche.prototype.feche;
    delete: typeof Feche.prototype.feche;
    put: typeof Feche.prototype.feche;
    patch: typeof Feche.prototype.feche;
    head: typeof Feche.prototype.feche;
    options: typeof Feche.prototype.feche;
    rpc: typeof Feche.prototype.feche;
};
declare const feche: FecheInstance;
export default feche;
