import { _methods, _defaultConfig, _defaultOptions, } from './types';
import _fetch from './_fetch';
export class Feche {
    constructor(config) {
        this._config = _defaultConfig;
        this._interceptors = {
            request: [],
            response: [],
        };
        this._config = { ...this.config, ...config };
    }
    config(config) {
        this._config = { ...this.config, ...config };
    }
    // request interceptor
    useRequest(fulfilled, rejected) {
        this._interceptors.request.push({
            fulfilled,
            rejected,
        });
        return this;
    }
    // response interceptor
    useResponse(fulfilled, rejected) {
        this._interceptors.response.push({
            fulfilled,
            rejected,
        });
        return this;
    }
    feche(url, options = {}) {
        const fecheInstanceOptions = {
            url: options.url || url,
            ..._defaultOptions,
        };
        let promise = Promise.resolve(fecheInstanceOptions);
        const chain = [_fetch, undefined];
        this._interceptors.request.forEach(ic => {
            chain.unshift(ic.fulfilled, ic.rejected);
        });
        this._interceptors.response.forEach(ic => {
            chain.push(ic.fulfilled, ic.rejected);
        });
        // if need to resolve response
        if (!options.getResponse) {
            chain.push((response) => (response.status ? response.data : response), (error) => Promise.reject(error));
        }
        // pipe to every interceptors
        while (chain.length) {
            promise = promise.then(chain.shift(), chain.shift());
        }
        return promise;
    }
}
function createInstance(config) {
    const context = new Feche(config);
    const instance = Feche.prototype.feche.bind(context);
    ['useRequest', 'useResponse', 'config'].forEach(method => (instance[method] = Feche.prototype[method].bind(context)));
    [..._methods].forEach(method => (instance[method] = (url, options) => Feche.prototype.feche.bind(context)(url, { ...options, method })));
    instance.config = context.config;
    return instance;
}
const feche = createInstance({});
feche.create = function create(config) {
    return createInstance(config);
};
export default feche;
//# sourceMappingURL=feche.js.map