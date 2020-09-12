export type Method = 'get' | 'post' | 'delete' | 'put' | 'patch' | 'head' | 'options' | 'rpc';

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

export type FecheInstanceOptions = Omit<FecheOptions, 'getResponse'> & {
  // url and method must exist in runtime
  url: string;
  method: Method;
  // getResponse exist with true or false
  getResponse: boolean;
};

export type FecheResponse<D = unknown> = Response & {
  data?: D;
  fecheOptions: FecheInstanceOptions;
};

export type FecheError<D = unknown> = Error & {
  isFecheError: boolean;
  response?: FecheResponse<D>;
  isAbortError?: boolean;
  isTimeoutError?: boolean;
};

//  constants
export const _methods: Method[] = [
  'get',
  'post',
  'delete',
  'put',
  'patch',
  'head',
  'options',
  'rpc',
];
export const _defaultConfig = { baseURL: '', timeout: -1 };
export const _defaultOptions = { method: 'get' as Method, timeout: 25000, getResponse: false };
