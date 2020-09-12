export type Service<D, P extends any[]> = (...args: P) => Promise<D>;

export interface Options<D, P extends any[]> {
  manual?: boolean;
  key?: string;
  initial?: D;
  params?: P;
  deps?: any[];

  refreshInterval?: number;

  onError?: (error: Error) => any;
  onSuccess?: (data: D) => any;

  shouldRetryOnError?: boolean;
  retryOn?: (error: Error) => boolean;
  retryCount?: number;
  retryDelay?: number;

  equalFun?: (a: D, b: D) => boolean;
}

export type Result<D, P extends any[]> = {
  data: null | D;
  loading: false;
  error: null | Error;
  run: (...args: P) => Promise<D>;
};
