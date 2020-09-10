function _fetch([input, init]) {
    return fetch(input, init).then((response) => {
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
export function createRequest({ baseURL, requestInterceptors, responseInterceptors, } = {}) {
    function request(input, init = {}) {
        if (!init.headers) {
            init.headers = {};
        }
        let ipt;
        if (baseURL) {
            if (typeof input === 'string') {
                ipt = `${baseURL}${input}`;
            }
            else {
                ipt = new Request(`${baseURL}${input.url}`);
            }
        }
        else {
            ipt = input;
        }
        let promise = Promise.resolve([ipt, init]);
        const chain = [_fetch, undefined];
        if (requestInterceptors === null || requestInterceptors === void 0 ? void 0 : requestInterceptors.length) {
            requestInterceptors.forEach(interceptors => {
                chain.unshift(interceptors[0], interceptors[1]);
            });
        }
        if (responseInterceptors === null || responseInterceptors === void 0 ? void 0 : responseInterceptors.length) {
            responseInterceptors.forEach(interceptor => {
                chain.push(interceptor[0], interceptor[1]);
            });
        }
        if (!init.getResponse) {
            chain.push((response) => response.data, (error) => Promise.reject(error));
        }
        while (chain.length) {
            promise = promise.then(chain.shift(), chain.shift());
        }
        return promise;
    }
    return request;
}
export default createRequest();
//# sourceMappingURL=Request.js.map