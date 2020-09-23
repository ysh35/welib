import {
  FecheConfig,
  FecheOptions,
  FecheRequestInterceptor,
  FecheResponseInterceptor,
  FecheRequest,
  FecheResponse,
  FecheError,
  _methods,
  _defaultConfig,
  _defaultOptions,
} from './types';

import _fetch from './_fetch';

export class Feche {
  _config: FecheConfig = _defaultConfig;
  _interceptors = {
    request: [] as FecheRequestInterceptor[],
    response: [] as FecheResponseInterceptor[],
  };

  constructor(config?: Partial<FecheConfig>) {
    this._config = { ...this.config, ...config };
  }

  config(config?: Partial<FecheConfig>) {
    this._config = { ...this.config, ...config };
  }

  // request interceptor
  useRequest(...args: FecheRequestInterceptor): Feche {
    this._interceptors.request.push(args);
    return this;
  }

  // response interceptor
  useResponse(...args: FecheResponseInterceptor): Feche {
    this._interceptors.response.push(args);
    return this;
  }

  feche<D>(fecheRequest: FecheRequest): Promise<FecheResponse<D>> {
    const options: FecheOptions =
      typeof fecheRequest === 'string' ? { url: fecheRequest } : fecheRequest;
    const fecheOptions: FecheOptions = {
      ..._defaultOptions,
      ...options,
    };

    let promise = Promise.resolve(fecheOptions);
    const chain = [_fetch, undefined] as any[];

    this._interceptors.request.forEach(ic => {
      chain.unshift(ic[0], ic[1]);
    });

    this._interceptors.response.forEach(ic => {
      chain.push(ic[0], ic[1]);
    });

    // pipe to every interceptors
    while (chain.length) {
      promise = promise.then(chain.shift(), chain.shift());
    }

    return promise as Promise<FecheResponse<D>>;
  }
}

// compose Factory and Instance
export type FecheInstance = typeof Feche.prototype.feche &
  Feche & {
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

function createInstance(config?: FecheConfig) {
  const context = new Feche(config);
  const instance = Feche.prototype.feche.bind(context) as FecheInstance;

  ['useRequest', 'useResponse', 'config'].forEach(
    method => (instance[method] = Feche.prototype[method].bind(context)),
  );
  [..._methods].forEach(
    method =>
      (instance[method] = (url: string, options: any) =>
        Feche.prototype.feche.bind(context)(url, { ...options, method })),
  );

  instance.config = context.config;

  return instance;
}

const feche = createInstance({}) as FecheInstance;

feche.create = function create(config?: FecheConfig) {
  return createInstance(config) as FecheInstance;
};

export default feche;
