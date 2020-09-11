function _fetch([url, options]) {
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
            timer = setTimeout(() => {
                clearTimeout(timer);
                timer = 0;
                abortController.abort();
            }, options.timeout);
        }
    }
    // rebind abort and signal to options
    options.abortController = abortController;
    options.signal = signal;
    // native fetch
    return fetch(url, options).then(
    // @ts-ignore
    (response) => {
        // clear timeout timer
        if (timer) {
            clearTimeout(timer);
            timer = 0;
        }
        response.options = options;
        return response.text().then(data => {
            let parsed;
            try {
                parsed = JSON.parse(data);
            }
            catch (error) {
                parsed = data;
            }
            // @ts-ignore
            response.data = parsed;
            if (response.ok) {
                return response;
            }
            else {
                const error = new Error(response.statusText);
                // @ts-ignore
                error.response = response;
                return Promise.reject(error);
            }
        }, error => {
            error.response = response;
            return Promise.reject(error);
        });
    }, error => {
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
    });
}
export function createRequest(_conf = {}) {
    const _inner = {
        chain: [_fetch, undefined],
        config: _conf,
    };
    function config(_conf = {}) {
        _inner.config = {
            ..._inner.config,
            ..._conf,
        };
    }
    function useReqMware(fulfilled, rejected) {
        _inner.chain.unshift(fulfilled, rejected);
    }
    function useResMware(fulfilled, rejected) {
        _inner.chain.push(fulfilled, rejected);
    }
    function request(url, options = {}) {
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
            chain.push((response) => response.data, (error) => Promise.reject(error));
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
//# sourceMappingURL=Request.js.map