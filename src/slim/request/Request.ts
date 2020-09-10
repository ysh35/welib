type Requester = RequestInit & {
  data?: unknown;
  getResponse?: true;
};

type Responses<S> = Response & {
  data?: S;
  input: RequestInfo;
  init: Requester;
};

type Payload = [input: RequestInfo, init: Requester];

function _fetch([input, init]: [input: RequestInfo, init: Requester]) {
  return fetch(input, init).then(
    // @ts-ignore
    (response: Responses<unknown>) => {
      response.input = input;
      response.init = init;
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
      return Promise.reject(error);
    },
  );
}

export function createRequest({ baseURL }: { baseURL?: string } = {}) {
  const _inner = {
    chain: [_fetch, undefined] as any[],
    baseURL,
  };

  function setBaseURL(url: string) {
    _inner.baseURL = url;
  }

  function useReqMware(
    fulfilled: (payload: Payload) => Payload,
    rejected: (err: Error) => Promise<never>,
  ) {
    _inner.chain.unshift(fulfilled, rejected);
  }

  function useResMware(
    fulfilled: (payload: Responses<unknown>) => Responses<unknown>,
    rejected: (
      err: Error & { response?: Responses<unknown> },
    ) => Promise<never> | Promise<Responses<unknown>>,
  ) {
    _inner.chain.push(fulfilled, rejected);
  }

  function request<D>(input: RequestInfo, init?: RequestInit & { data?: any }): Promise<D>;
  function request<D>(
    input: RequestInfo,
    init?: RequestInit & { data?: any; getResponse?: true },
  ): Promise<Responses<D>>;
  function request(input: any, init: any = {}) {
    if (!init.headers) {
      init.headers = {};
    }

    const ipt: RequestInfo =
      typeof input === 'string'
        ? input.startsWith('http')
          ? input
          : `${_inner.baseURL}${input}`
        : new Request(input.url);

    let promise = Promise.resolve([ipt, init]);

    if (!init.getResponse) {
      _inner.chain.push(
        (response: Responses<unknown>) => response.data,
        (error: Error) => Promise.reject(error),
      );
    }

    const chain = _inner.chain.slice(0);

    while (chain.length) {
      promise = promise.then(chain.shift(), chain.shift());
    }

    return promise as any;
  }

  request.setBaseURL = setBaseURL;
  request.useReqMware = useReqMware;
  request.useResMware = useResMware;

  return request;
}

export default createRequest();
