// @ts-ignore
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
// @ts-ignore
import equal from 'fast-deep-equal';
// @ts-ignore
import request from './request';
const isPromise = (v) => typeof v.then === 'function';
function useRequest(service, option = {}) {
    const refreshTimer = useRef(0);
    const retryTimer = useRef(0);
    const unmountedRef = useRef(false);
    const _options = {
        params: [],
        retryDelay: 5000,
        ...option,
    };
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
        data: _options.initial,
        loading: !_options.manual,
        error: null,
    });
    const rerender = useState(null)[1];
    const dispatch = useCallback((payload) => {
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
            if (unmountedRef.current)
                return;
            rerender({});
        }
    }, []);
    const run = (...args) => {
        const mergedArgs = args.length > 0 ? args : refParams.current;
        dispatch({
            loading: true,
        });
        return new Promise((resolve, reject) => {
            const serviceResult = service(...mergedArgs);
            const promise = (isPromise(serviceResult)
                ? serviceResult
                : Array.isArray(serviceResult)
                    ? request(...serviceResult)
                    : // eslint-disable-next-line no-undef
                        request(serviceResult));
            promise
                .then(res => {
                dispatch(stateRef.current.error
                    ? {
                        loading: false,
                        data: res,
                        error: null,
                    }
                    : {
                        loading: false,
                        data: res,
                    });
                if (option.refreshInterval) {
                    if (refreshTimer.current) {
                        clearTimeout(refreshTimer.current);
                    }
                    refreshTimer.current = setTimeout(() => {
                        return run(...args);
                    }, _options.refreshInterval);
                }
                return resolve(res);
            })
                .catch(error => {
                var _a;
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
                    retryTimer.current = setTimeout(() => {
                        return run(...args);
                    }, _options.retryDelay);
                }
                else if (((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) >= 500) {
                    // @ts-ignore
                    retryTimer.current = setTimeout(() => {
                        return run(...args);
                    }, _options.retryDelay);
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
        const derived = {
            run,
        };
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
//# sourceMappingURL=useRequest.js.map