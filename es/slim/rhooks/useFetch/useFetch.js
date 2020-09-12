import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { equal, isDocumentVisible, isOnline, IS_SERVER } from './utils';
export default function useFetch(service, option = {}) {
    // merged options
    const _options = {
        params: [],
        deps: [],
        shouldRetryOnError: true,
        retryDelay: 5000,
        retryCount: 5,
        ...option,
    };
    const refParams = useRef(_options.params);
    const refStates = useRef({
        data: _options.initial,
        loading: !_options.manual,
        error: undefined,
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
    const dispatch = useCallback((payload) => {
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
            if (refUnmounted.current)
                return;
            rerender({});
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
            refreshTimer.current = setTimeout(() => {
                return run(...refParams.current);
            }, _options.refreshInterval);
            return;
        }
        if (refStates.current.error &&
            _options.shouldRetryOnError &&
            refRetryCount.current > 0 &&
            (refStates.current.error.name === 'AbortError'
                ? refStates.current.error.isTimeoutError
                : true) &&
            (_options.retryOn ? _options.retryOn(refStates.current.error) : true)) {
            // console.info('will retry with error...');
            retryTimer.current = setTimeout(() => {
                return run(...refParams.current);
            }, _options.retryDelay);
            refRetryCount.current -= 1;
        }
    }, []);
    const run = (...args) => {
        clearTimer();
        if (args) {
            refParams.current = args;
        }
        dispatch({
            loading: true,
        });
        return service(...refParams.current)
            .then(data => {
            if (_options.onSuccess) {
                _options.onSuccess(data);
            }
            dispatch(refStates.current.error
                ? {
                    loading: false,
                    data,
                    error: null,
                }
                : {
                    loading: false,
                    data,
                });
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
        }
        else {
            refMounted.current = true;
        }
    }, _options.deps);
    // return result
    return useMemo(() => {
        const derived = {
            run,
        };
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
//# sourceMappingURL=useFetch.js.map