export type Method = 'get' | 'post' | 'delete' | 'put' | 'patch' | 'head' | 'options' | 'rpc';

// meta types
export interface FecheConfig {
  baseURL?: string;
  timeout?: number;
}
export interface FecheOptions extends RequestInit {
  url: string;
}

// interceptor types
export type FecheRequestInterceptor = [
  fulfilled: (fecheOptions: FecheOptions) => FecheOptions,
  rejected: (error: FecheError) => FecheOptions | Promise<never>,
];
export type FecheResponseInterceptor = [
  fulfilled: (response: FecheResponse) => FecheResponse,
  rejected: (error: FecheError) => FecheResponse | Promise<never>,
];

// input and output types
export type FecheRequest = 'string' | FecheOptions;
export type FecheResponse<D = unknown> = Response & {
  data?: D;
  fecheOptions: FecheOptions;
};
export type FecheError<D = unknown> = Error & {
  isFecheError: boolean;
  response?: FecheResponse<D>;
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
export const _defaultOptions = { method: 'get' as Method, timeout: 25000 };
