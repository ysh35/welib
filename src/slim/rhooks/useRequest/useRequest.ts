import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// import equal from 'fast-deep-equal';

const equal = (a: any, b: any) => a === b;

type Service<D, P extends any[]> = (...args: P) => Promise<D>;

interface Options<D, P extends any[]> {
  manual?: boolean;
  key?: string;
  initial?: D;
  params?: P;
  refreshInterval?: number;
  onError?: (error: Error) => any;
  onSuccess?: (data: D) => any;
  retryDelay?: number;
  retryOn?: (error: Error) => boolean;
  equalFun?: (a: D, b: D) => boolean;
}

type Result<D, P extends any[]> = {
  data: null | D;
  loading: false;
  error: null | Error;
  run: (...args: P) => Promise<D>;
};

function useRequest<D, P extends any[] = any[]>(
  service: Service<D, P>,
  option: Options<D, P> = {},
): Result<D, P> {
  const refreshTimer = useRef(0);
  const retryTimer = useRef(0);
  const unmountedRef = useRef(false);

  const _options: Required<Options<D, P>> = {
    params: ([] as unknown) as P,
    retryDelay: 5000,
    ...option,
  } as Required<Options<D, P>>;

  const refParams = useRef(_options.params);

  const depRef = useRef({
    data: false,
    loading: false,
    error: false,
  });

  useEffect(() => {
    refParams.current = _options.params;
  }, _options.params);

  const stateRef = useRef({
    data: _options.initial as null | D,
    loading: !_options.manual,
    error: null as null | Error,
  });

  const rerender = useState(null)[1];
  const dispatch = useCallback((payload: { [x: string]: any }) => {
    let shouldUpdateState = false;
    const eq = option.equalFun || equal;
    for (const k in payload) {
      if (!eq(stateRef.current[k], payload[k])) {
        stateRef.current[k] = payload[k];
        if (depRef.current[k]) {
          shouldUpdateState = true;
        }
      }
    }
    if (shouldUpdateState) {
      if (unmountedRef.current) return;
      rerender({} as any);
    }
  }, []);

  const run = (...args: P) => {
    const mergedArgs = args.length > 0 ? args : refParams.current;
    dispatch({
      loading: true,
    });

    return new Promise((resolve, reject) => {
      const promise = service(...mergedArgs);

      promise
        .then(res => {
          dispatch(
            stateRef.current.error
              ? {
                  loading: false,
                  data: res,
                  error: null,
                }
              : {
                  loading: false,
                  data: res,
                },
          );

          if (option.refreshInterval) {
            if (refreshTimer.current) {
              clearTimeout(refreshTimer.current);
            }
            refreshTimer.current = (setTimeout(() => {
              return run(...args);
            }, _options.refreshInterval) as unknown) as number;
          }
          return resolve(res);
        })
        .catch(error => {
          if (refreshTimer.current) {
            clearTimeout(refreshTimer.current);
          }
          if (retryTimer.current) {
            clearTimeout(retryTimer.current);
          }
          dispatch({
            loading: false,
            error,
          });

          if (_options.onError) {
            _options.onError(error);
          }

          if (_options.retryOn && _options.retryOn(error)) {
            retryTimer.current = (setTimeout(() => {
              return run(...args);
            }, _options.retryDelay) as unknown) as number;
          } else if (error.response?.status >= 500) {
            // @ts-ignore
            retryTimer.current = setTimeout(() => {
              return run(...args);
            }, _options.retryDelay as any) as number;
          }

          // return reject(error);
        });
    });
  };

  useEffect(() => {
    if (!_options.manual) {
      run(...refParams.current)
        .then()
        .catch(e => {
          console.error(e);
        });
    }
    return () => {
      unmountedRef.current = true;
    };
  }, []);

  return useMemo(() => {
    const derived = ({
      run,
    } as unknown) as Result<D, P>;
    Object.defineProperties(derived, {
      error: {
        get: function () {
          depRef.current.error = true;
          return stateRef.current.error;
        },
        enumerable: true,
      },
      data: {
        get: function () {
          depRef.current.data = true;
          return stateRef.current.data;
        },
        enumerable: true,
      },
      loading: {
        get: function () {
          depRef.current.loading = true;
          return stateRef.current.loading;
        },
        enumerable: true,
      },
    });
    return derived;
  }, []);
}

export default useRequest;
