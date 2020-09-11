function _fetch([input, init]) {
    return fetch(input, init).then(
    // @ts-ignore
    (response) => {
        response.input = input;
        response.init = init;
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
        return Promise.reject(error);
    });
}
export function createRequest({ baseURL } = {}) {
    const _inner = {
        chain: [_fetch, undefined],
        baseURL,
    };
    function setBaseURL(url) {
        _inner.baseURL = url;
    }
    function useReqMware(fulfilled, rejected) {
        _inner.chain.unshift(fulfilled, rejected);
    }
    function useResMware(fulfilled, rejected) {
        _inner.chain.push(fulfilled, rejected);
    }
    function request(input, init = {}) {
        if (!init.headers) {
            init.headers = {};
        }
        const ipt = typeof input === 'string'
            ? input.startsWith('http')
                ? input
                : `${_inner.baseURL}${input}`
            : new Request(input.url);
        let promise = Promise.resolve([ipt, init]);
        const chain = _inner.chain.slice(0);
        if (!init.getResponse) {
            chain.push((response) => response.data, (error) => Promise.reject(error));
        }
        while (chain.length) {
            promise = promise.then(chain.shift(), chain.shift());
        }
        return promise;
    }
    request.setBaseURL = setBaseURL;
    request.useReqMware = useReqMware;
    request.useResMware = useResMware;
    return request;
}
export default createRequest();
//# sourceMappingURL=Request.js.map