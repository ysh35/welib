import {
  FecheConfig,
  FecheOptions,
  FecheInstanceOptions,
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
    request: [] as {
      fulfilled: (fecheOptions: FecheInstanceOptions) => FecheInstanceOptions;
      rejected: (error: FecheError) => FecheInstanceOptions | Promise<never>;
    }[],
    response: [] as {
      fulfilled: (response: FecheResponse) => FecheResponse;
      rejected: (error: FecheError) => FecheResponse | Promise<never>;
    }[],
  };

  constructor(config?: Partial<FecheConfig>) {
    this._config = { ...this.config, ...config };
  }

  config(config?: Partial<FecheConfig>) {
    this._config = { ...this.config, ...config };
  }

  // request interceptor
  useRequest(
    fulfilled: (fecheOptions: FecheInstanceOptions) => FecheInstanceOptions,
    rejected: (error: FecheError) => FecheInstanceOptions | Promise<never>,
  ): Feche {
    this._interceptors.request.push({
      fulfilled,
      rejected,
    });
    return this;
  }

  // response interceptor
  useResponse(
    fulfilled: (response: FecheResponse) => FecheResponse,
    rejected: (error: FecheError) => FecheResponse | Promise<never>,
  ): Feche {
    this._interceptors.response.push({
      fulfilled,
      rejected,
    });
    return this;
  }

  feche<D>(
    url: string,
    options: Omit<FecheOptions, 'getResponse'> & { getResponse: true },
  ): Promise<FecheResponse<D>>;
  feche<D>(url: string, options?: Omit<FecheOptions, 'getResponse'>): Promise<D>;
  feche<D>(url: string, options: any = {}): any {
    const fecheInstanceOptions: FecheInstanceOptions = {
      url: options.url || url,
      ..._defaultOptions,
    };

    let promise = Promise.resolve(fecheInstanceOptions);
    const chain = [_fetch, undefined] as any[];

    this._interceptors.request.forEach(ic => {
      chain.unshift(ic.fulfilled, ic.rejected);
    });

    this._interceptors.response.forEach(ic => {
      chain.push(ic.fulfilled, ic.rejected);
    });

    // if need to resolve response
    if (!options.getResponse) {
      chain.push(
        (response: FecheResponse) => (response.status ? response.data : response),
        (error: Error) => Promise.reject(error),
      );
    }

    // pipe to every interceptors
    while (chain.length) {
      promise = promise.then(chain.shift(), chain.shift());
    }

    return promise;
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
