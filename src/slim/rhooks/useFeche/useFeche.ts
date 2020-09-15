import { FecheOptions, FecheResponse } from '../../feche/types';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { equal, IS_SERVER, isDocumentVisible, isOnline } from '../useFetch/utils';
import feche from '../../feche/feche';

export type FechePayload = string | (Omit<FecheOptions, 'url'> & { url: string });

export type Config = {
  feche: (payload: FechePayload) => Promise<unknown>;
};

export type Service<D, P extends any[]> = (...args: P) => FechePayload;

const _config = {
  feche,
};

export function config(conf: Config) {
  Object.assign(_config, conf);
}

export interface Options<D, P extends any[]> {
  manual?: boolean;
  key?: string;
  initial?: D;
  params?: P;
  deps?: any[];

  refreshInterval?: number;

  onError?: (error?: Error) => any;
  onSuccess?: (data?: D) => any;

  shouldRetryOnError?: boolean;
  retryOn?: (error: Error) => boolean;
  retryCount?: number;
  retryDelay?: number;

  equalFun?: (a: D, b: D) => boolean;
}

export type Result<D, P extends any[]> = {
  data?: D;
  loading: false;
  error?: null | Error;
  response?: FecheResponse;
  cancel: () => any;
  run: (...args: P) => Promise<D>;
};
export default function useFetch<
  D,
  P extends any[] = any[],
  E extends Error & { isTimeoutError: boolean } = Error & { isTimeoutError: boolean }
>(service: Service<D, P>, option: Options<D, P> = {}): Result<D, P> {
  // merged options
  const _options: Required<Options<D, P>> = {
    params: ([] as unknown) as P,
    deps: [],
    shouldRetryOnError: true,
    retryDelay: 5000,
    retryCount: 5,
    ...option,
  } as Required<Options<D, P>>;

  const refParams = useRef(_options.params);
  const refStates = useRef({
    data: _options.initial as undefined | D,
    loading: !_options.manual,
    error: undefined as undefined | E,
  });
  const refDependencies = useRef({
    data: false,
    loading: false,
    error: false,
  });

  const refreshTimer = useRef(0);
  const retryTimer = useRef(0);
  const refRetryCount = useRef(_options.retryCount);

  const refMounted = useRef(false);
  const refUnmounted = useRef(false);

  const rerender = useState(null)[1];
  const dispatch = useCallback((payload: { [x: string]: any }) => {
    let shouldUpdateState = false;
    const eq = option.equalFun || equal;
    for (const k in payload) {
      if (!eq(refStates.current[k], payload[k])) {
        refStates.current[k] = payload[k];

        if (refDependencies.current[k]) {
          shouldUpdateState = true;
        }
      }
    }
    if (shouldUpdateState) {
      if (refUnmounted.current) return;
      rerender({} as any);
    }
  }, []);

  const clearTimer = useCallback(() => {
    // clear all timers
    if (refreshTimer.current) {
      clearTimeout(refreshTimer.current);
      refreshTimer.current = 0;
    }
    if (retryTimer.current) {
      clearTimeout(retryTimer.current);
      retryTimer.current = 0;
    }
  }, []);

  const tryRefreshOrRetry = useCallback(() => {
    clearTimer();

    if (!isOnline() || !isDocumentVisible()) {
      // console.log('offline or hidden and will not Refresh or Retry');
      return;
    }
    if (_options.refreshInterval) {
      // console.info(`will refresh with ${error ? 'error' : 'success'}...`);
      refreshTimer.current = (setTimeout(() => {
        return run(...refParams.current);
      }, _options.refreshInterval) as unknown) as number;
      return;
    }

    if (
      refStates.current.error &&
      _options.shouldRetryOnError &&
      refRetryCount.current > 0 &&
      (refStates.current.error.name === 'AbortError'
        ? refStates.current.error.isTimeoutError
        : true) &&
      (_options.retryOn ? _options.retryOn(refStates.current.error) : true)
    ) {
      // console.info('will retry with error...');
      retryTimer.current = (setTimeout(() => {
        return run(...refParams.current);
      }, _options.retryDelay) as unknown) as number;
      refRetryCount.current -= 1;
    }
  }, []);

  const run = (...args: P) => {
    clearTimer();

    if (args) {
      refParams.current = args;
    }
    dispatch({
      loading: true,
    });

    const opts = service(...refParams.current);
    const url = typeof opts === 'string' ? opts : opts.url;

    return _config
      .feche<D>(
        url,
        (opts ? { ...(opts as FecheOptions), getResponse: true } : {}) as FecheOptions & {
          getResponse: true;
        },
      )
      .then(res => {
        if (_options.onSuccess) {
          _options.onSuccess(res.data);
        }
        dispatch(
          refStates.current.error
            ? {
                loading: false,
                data,
                error: null,
              }
            : {
                loading: false,
                data,
              },
        );
        tryRefreshOrRetry();
        return Promise.resolve(data);
      })
      .catch(error => {
        if (_options.onError) {
          _options.onError(error);
        }
        dispatch({
          loading: false,
          error,
        });
        tryRefreshOrRetry();
        // return Promise.reject(error);
      });
  };

  // sync params
  useEffect(() => {
    refParams.current = _options.params;
  }, _options.params);

  // initialize
  useEffect(() => {
    refParams.current = _options.params;
    if (!_options.manual) {
      run(...refParams.current)
        .then()
        .catch(e => {
          console.error(e);
        });
    }

    if (!IS_SERVER && window.addEventListener) {
      window.addEventListener('visibilitychange', tryRefreshOrRetry, false);
    }

    return () => {
      if (!IS_SERVER && window.addEventListener) {
        window.removeEventListener('visibilitychange', tryRefreshOrRetry);
      }
      refUnmounted.current = true;
    };
  }, []);

  // listen deps change
  useEffect(() => {
    if (refMounted.current) {
      run(...refParams.current)
        .then()
        .catch(e => {
          console.error(e);
        });
    } else {
      refMounted.current = true;
    }
  }, _options.deps);

  // return result
  return useMemo(() => {
    const derived = ({
      run,
    } as unknown) as Result<D, P>;
    Object.defineProperties(derived, {
      error: {
        get: function () {
          refDependencies.current.error = true;
          return refStates.current.error;
        },
        enumerable: true,
      },
      data: {
        get: function () {
          refDependencies.current.data = true;
          return refStates.current.data;
        },
        enumerable: true,
      },
      loading: {
        get: function () {
          refDependencies.current.loading = true;
          return refStates.current.loading;
        },
        enumerable: true,
      },
    });
    return derived;
  }, []);
}
