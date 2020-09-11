export type RequestConfig = {
  baseURL?: string;
  timeout?: number;
};

export type RequestOptions = RequestInit & {
  data?: unknown;
  getResponse?: true;
  timeout?: number;
  abortController?: AbortController;
};

export type RequestResponse<S = unknown> = Response & {
  data?: S;
  options: RequestOptions;
};

export type RequestError = Error & {
  response?: RequestResponse;
  isAbortError?: boolean;
  isTimeoutError?: boolean;
};

function _fetch([url, options]: [url: string, options: RequestOptions]) {
  let timer = 0;
  let abortController = options.abortController;
  let signal = options.signal;

  // if timeout
  if (options.timeout) {
    // initialize signal
    if (!signal) {
      abortController = new AbortController();
      signal = abortController.signal;
    }

    // if abortController
    if (abortController) {
      timer = (setTimeout(() => {
        clearTimeout(timer);
        timer = 0;
        abortController!.abort();
      }, options.timeout) as unknown) as number;
    }
  }

  // rebind abort and signal to options
  options.abortController = abortController;
  options.signal = signal;

  // native fetch
  return fetch(url, options).then(
    // @ts-ignore
    (response: RequestResponse) => {
      // clear timeout timer
      if (timer) {
        clearTimeout(timer);
        timer = 0;
      }

      response.options = options;
      return response.text().then(
        data => {
          let parsed;
          try {
            parsed = JSON.parse(data);
          } catch (error) {
            parsed = data;
          }
          // @ts-ignore
          response.data = parsed;

          if (response.ok) {
            return response;
          } else {
            const error = new Error(response.statusText);
            // @ts-ignore
            error.response = response;
            return Promise.reject(error);
          }
        },
        error => {
          error.response = response;
          return Promise.reject(error);
        },
      );
    },
    error => {
      if (error.name === 'AbortError') {
        error.isAbortError = true;
        // check if abort by cancel or timeout
        error.isTimeoutError = options.abortController ? !timer : false;
      }

      // clear timeout timer
      if (timer) {
        clearTimeout(timer);
        timer = 0;
      }
      return Promise.reject(error);
    },
  );
}

export function createRequest(_conf: Partial<RequestConfig> = {}) {
  const _inner = {
    chain: [_fetch, undefined] as any[],
    config: _conf,
  };

  function config(_conf: Partial<RequestConfig> = {}) {
    _inner.config = {
      ..._inner.config,
      ..._conf,
    };
  }

  function useReqMware(
    fulfilled: (
      request: [url: string, options: RequestOptions],
    ) => [url: string, options: RequestOptions],
    rejected: (err: Error) => Promise<never>,
  ) {
    _inner.chain.unshift(fulfilled, rejected);
  }

  function useResMware(
    fulfilled: (response: RequestResponse) => RequestResponse,
    rejected: (
      err: Error & { response?: RequestResponse },
    ) => Promise<never> | Promise<RequestResponse>,
  ) {
    _inner.chain.push(fulfilled, rejected);
  }

  function request<D>(url: string, options?: Omit<RequestOptions, 'getResponse'>): Promise<D>;
  function request<D>(
    url: string,
    options?: Omit<RequestOptions, 'getResponse'> & { getResponse: true },
  ): Promise<RequestResponse<D>>;
  function request(url: string, options: RequestOptions = {}): any {
    // provide timeout from config
    if (!options.timeout) {
      options.timeout = _inner.config.timeout;
    }

    // request promise
    let promise = Promise.resolve([
      // provide baseURL from config to relative url
      url.startsWith('http') ? url : `${_inner.config.baseURL}${url}`,
      options,
    ]);

    // copy chain
    const chain = _inner.chain.slice(0);

    // if need to resolve response
    if (!options.getResponse) {
      chain.push(
        (response: RequestResponse) => response.data,
        (error: Error) => Promise.reject(error),
      );
    }

    // pipe to every interceptors
    while (chain.length) {
      promise = promise.then(chain.shift(), chain.shift());
    }

    return promise;
  }

  request.config = config;
  request.useReqMware = useReqMware;
  request.useResMware = useResMware;

  return request;
}

export default createRequest();
