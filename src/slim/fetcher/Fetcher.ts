export const methods = ['get', 'post', 'delete', 'put', 'patch', 'head', 'options', 'rpc'];
export const contentTypes = ['arraybuffer', 'blob', 'document', 'json', 'text', 'stream'];

// fetch configuration
export interface FetcherConfig {
  baseURL?: string;
}

// fetch payload
export interface FetcherInit extends RequestInit {
  method?: string;
  url: string;
}

// fetch response
export interface FetcherResponse<D = unknown> extends Response {
  fetcherInit: FetcherInit;
  data?: D;
}

// fetch error
export class FetcherError<E = unknown> extends Error {
  isFetcherError = true;
  fetcherInit: FetcherInit = { url: '' };
  response?: FetcherResponse<E>;
}

// response handling
function handle(res: FetcherResponse, rs: any, response: boolean) {
  res.data = rs;

  if (res.ok) {
    return response ? res : rs;
  }
  const err = new FetcherError(`${res.status} ${res.statusText}`);
  err.isFetcherError = true;
  err.fetcherInit = res.fetcherInit;
  err.response = res;
  return Promise.reject(err);
}

// inner fetch
function _fetcher(fetcherInit: FetcherInit & { baseURL?: string; response: boolean }) {
  return fetch(`${fetcherInit.baseURL || ''}${fetcherInit.url}`, fetcherInit).then(
    (res: Response) => {
      // append fetcherInit to success response
      (res as FetcherResponse).fetcherInit = fetcherInit;
      const contentType = res.headers.get('Content-Type');

      if (contentType && contentType.indexOf('application/json') > -1) {
        return res.json().then(rs => handle(res as FetcherResponse, rs, fetcherInit.response));
      } else if (contentType && contentType.indexOf('text/plain') > -1) {
        return res.text().then(rs => handle(res as FetcherResponse, rs, fetcherInit.response));
      }
      return handle(res as FetcherResponse, undefined, fetcherInit.response);
    },
    err => {
      // append fetcherInit to error without response
      (err as FetcherError).fetcherInit = fetcherInit;
      return Promise.reject(err);
    },
  );
}

// default config
const defaultFetcherConfig = {
  baseURL: '',
} as FetcherConfig;

// default fetcherInit
const defaultFetcherInit = ({
  headers: {
    Accept: 'application/json, text/plain, */*',
    'Content-Type': 'application/json',
  },
} as unknown) as FetcherInit;

// main class Fetcher
export class Fetcher {
  // config
  config: FetcherConfig = defaultFetcherConfig;

  // interceptors container
  interceptors = {
    request: [] as { fulfilled: any; rejected?: any }[],
    response: [] as { fulfilled: any; rejected?: any }[],
  };

  // constructor
  constructor(config: Partial<FetcherConfig>) {
    this.config = { ...this.config, ...config };
  }

  // request interceptor
  useRequest(
    fulfilled: (fetcherInit: FetcherInit) => any,
    rejected?: (res: FetcherError) => any,
  ): Fetcher {
    this.interceptors.request.push({
      fulfilled,
      rejected,
    });
    return this;
  }

  // response interceptor
  useResponse(
    fulfilled: (res: FetcherResponse) => any,
    rejected?: (res: FetcherError) => any,
  ): Fetcher {
    this.interceptors.response.push({
      fulfilled,
      rejected,
    });
    return this;
  }

  // primary functional
  fetch<D>(url: string): Promise<D>;
  fetch<D>(fetcherInit: FetcherInit): Promise<D>;
  fetch<D>(fetcherInit: FetcherInit & { response: true }): Promise<FetcherResponse<D>>;
  fetch<D>(url: string, fetcherInit?: Omit<FetcherInit, 'url'>): Promise<D>;
  fetch<D>(
    url: string,
    fetcherInit?: Omit<FetcherInit & { response: true }, 'url'>,
  ): Promise<FetcherResponse<D>>;
  fetch<D>(urlOrFetcherInit: any, fetcherInit?: any): any {
    const _headers = {
      ...defaultFetcherInit.headers,
      ...fetcherInit?.headers,
    };
    const isUrlOrFetcherInitString = typeof urlOrFetcherInit === 'string';
    const _fetcherInit: FetcherInit & { baseURL?: string; response: boolean } = {
      ...(isUrlOrFetcherInitString ? fetcherInit : (urlOrFetcherInit as FetcherInit)),
      baseURL: this.config.baseURL,
      url: isUrlOrFetcherInitString
        ? (urlOrFetcherInit as string)
        : (urlOrFetcherInit as FetcherInit).url,
      headers: _headers,
      response: isUrlOrFetcherInitString
        ? (fetcherInit as any)?.response || false
        : (urlOrFetcherInit as any)?.response || false,
    };

    let promise = Promise.resolve(_fetcherInit);
    const chain = [_fetcher, undefined];

    this.interceptors.request.forEach(ic => {
      chain.unshift(ic.fulfilled, ic.rejected);
    });

    this.interceptors.response.forEach(ic => {
      chain.push(ic.fulfilled, ic.rejected);
    });

    while (chain.length) {
      promise = promise.then(chain.shift(), chain.shift());
    }

    return promise;
  }
  get<D>(url: string, fetcherInit: Omit<FetcherInit, 'url'> = {}): Promise<any> {
    return this.fetch({ ...fetcherInit, url, method: 'get' });
  }
  post<D>(url: string, fetcherInit: Omit<FetcherInit, 'url'> = {}): Promise<any> {
    return this.fetch({ ...fetcherInit, url, method: 'post' });
  }
  delete<D>(url: string, fetcherInit: Omit<FetcherInit, 'url'> = {}): Promise<any> {
    return this.fetch({ ...fetcherInit, url, method: 'delete' });
  }
  put<D>(url: string, fetcherInit: Omit<FetcherInit, 'url'> = {}): Promise<any> {
    return this.fetch({ ...fetcherInit, url, method: 'put' });
  }
  patch<D>(url: string, fetcherInit: Omit<FetcherInit, 'url'> = {}): Promise<any> {
    return this.fetch({ ...fetcherInit, url, method: 'patch' });
  }
  head<D>(url: string, fetcherInit: Omit<FetcherInit, 'url'> = {}): Promise<any> {
    return this.fetch({ ...fetcherInit, url, method: 'head' });
  }
  options<D>(url: string, fetcherInit: Omit<FetcherInit, 'url'> = {}): Promise<any> {
    return this.fetch({ ...fetcherInit, url, method: 'options' });
  }
  rpc<D>(url: string, fetcherInit: Omit<FetcherInit, 'url'> = {}): Promise<any> {
    return this.fetch({ ...fetcherInit, url, method: 'rpc' });
  }
}

// compose Factory and Instance
export type FetcherInstance = typeof Fetcher.prototype.fetch &
  Fetcher & { create: (config: FetcherConfig) => FetcherInstance };

function createInstance(config: FetcherConfig) {
  const context = new Fetcher(config);
  const instance = Fetcher.prototype.fetch.bind(context) as FetcherInstance;

  ['useRequest', 'useResponse', ...methods].forEach(
    method => (instance[method] = Fetcher.prototype[method].bind(context)),
  );

  instance.config = context.config;
  return instance;
}

const fetcher = createInstance({}) as FetcherInstance;

fetcher.create = function create(config: FetcherConfig) {
  return createInstance(config) as FetcherInstance;
};

export default fetcher;
