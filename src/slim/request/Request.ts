type Requester = RequestInit & {
  data?: unknown;
  getResponse?: true;
};

type Responses<S> = Response & {
  data?: S;
  input?: RequestInfo;
  init?: Requester;
};

type Payload = [input: RequestInfo, init: Requester];

function _fetch([input, init]: [input: RequestInfo, init: Requester]) {
  return fetch(input, init).then(
    (response: Response) => {
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

type Creator = {
  baseURL?: string;
  requestInterceptors?: Array<[(payload: Payload) => Payload, (err: Error) => Promise<never>]>;
  responseInterceptors?: Array<
    [
      (payload: Responses<unknown>) => Responses<unknown>,
      (
        err: Error & { response: Responses<unknown> },
      ) => Promise<never> | Promise<Responses<unknown>>,
    ]
  >;
};

export function createRequest({
  baseURL,
  requestInterceptors,
  responseInterceptors,
}: Creator = {}) {
  function request<D>(input: RequestInfo, init?: RequestInit & { data?: any }): Promise<D>;
  function request<D>(
    input: RequestInfo,
    init?: RequestInit & { data?: any; getResponse?: true },
  ): Promise<Responses<D>>;
  function request(input: any, init: any = {}) {
    if (!init.headers) {
      init.headers = {};
    }
    let ipt: RequestInfo;

    if (baseURL) {
      if (typeof input === 'string') {
        ipt = `${baseURL}${input}`;
      } else {
        ipt = new Request(`${baseURL}${input.url}`);
      }
    } else {
      ipt = input;
    }

    let promise = Promise.resolve([ipt, init]);

    const chain: any = [_fetch, undefined];

    if (requestInterceptors?.length) {
      requestInterceptors.forEach(interceptors => {
        chain.unshift(interceptors[0], interceptors[1]);
      });
    }
    if (responseInterceptors?.length) {
      responseInterceptors.forEach(interceptor => {
        chain.push(interceptor[0], interceptor[1]);
      });
    }

    if (!init.getResponse) {
      chain.push(
        (response: Responses<unknown>) => response.data,
        (error: Error) => Promise.reject(error),
      );
    }

    while (chain.length) {
      promise = promise.then(chain.shift(), chain.shift());
    }

    return promise as any;
  }

  return request;
}

export default createRequest();
