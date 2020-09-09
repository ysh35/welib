export const methods = ['get', 'post', 'delete', 'put', 'patch', 'head', 'options', 'rpc'];
export const contentTypes = ['arraybuffer', 'blob', 'document', 'json', 'text', 'stream'];
// fetch error
export class FetcherError extends Error {
    constructor() {
        super(...arguments);
        this.isFetcherError = true;
        this.fetcherInit = { url: '' };
    }
}
// response handling
function handle(res, rs, response) {
    res.data = rs;
    if (res.ok) {
        return response ? res : rs;
    }
    const err = new FetcherError(`${res.status} ${res.statusText}`);
    err.isFetcherError = true;
    err.fetcherInit = res.fetcherInit;
    err.response = res;
    return Promise.reject(err);
}
// inner fetch
function _fetcher(fetcherInit) {
    return fetch(`${fetcherInit.baseURL || ''}${fetcherInit.url}`, fetcherInit).then((res) => {
        // append fetcherInit to success response
        res.fetcherInit = fetcherInit;
        const contentType = res.headers.get('Content-Type');
        if (contentType && contentType.indexOf('application/json') > -1) {
            return res.json().then(rs => handle(res, rs, fetcherInit.response));
        }
        else if (contentType && contentType.indexOf('text/plain') > -1) {
            return res.text().then(rs => handle(res, rs, fetcherInit.response));
        }
        return handle(res, undefined, fetcherInit.response);
    }, err => {
        // append fetcherInit to error without response
        err.fetcherInit = fetcherInit;
        return Promise.reject(err);
    });
}
// default config
const defaultFetcherConfig = {
    baseURL: '',
};
// default fetcherInit
const defaultFetcherInit = {
    headers: {
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
    },
};
// main class Fetcher
export class Fetcher {
    // constructor
    constructor(config) {
        // config
        this.config = defaultFetcherConfig;
        // interceptors container
        this.interceptors = {
            request: [],
            response: [],
        };
        this.config = { ...this.config, ...config };
    }
    // request interceptor
    useRequest(fulfilled, rejected) {
        this.interceptors.request.push({
            fulfilled,
            rejected,
        });
        return this;
    }
    // response interceptor
    useResponse(fulfilled, rejected) {
        this.interceptors.response.push({
            fulfilled,
            rejected,
        });
        return this;
    }
    fetch(urlOrFetcherInit, fetcherInit) {
        var _a, _b;
        const _headers = {
            ...defaultFetcherInit.headers,
            ...fetcherInit === null || fetcherInit === void 0 ? void 0 : fetcherInit.headers,
        };
        const isUrlOrFetcherInitString = typeof urlOrFetcherInit === 'string';
        const _fetcherInit = {
            ...(isUrlOrFetcherInitString ? fetcherInit : urlOrFetcherInit),
            baseURL: this.config.baseURL,
            url: isUrlOrFetcherInitString
                ? urlOrFetcherInit
                : urlOrFetcherInit.url,
            headers: _headers,
            response: isUrlOrFetcherInitString
                ? ((_a = fetcherInit) === null || _a === void 0 ? void 0 : _a.response) || false
                : ((_b = urlOrFetcherInit) === null || _b === void 0 ? void 0 : _b.response) || false,
        };
        let promise = Promise.resolve(_fetcherInit);
        const chain = [_fetcher, undefined];
        this.interceptors.request.forEach(ic => {
            chain.unshift(ic.fulfilled, ic.rejected);
        });
        this.interceptors.response.forEach(ic => {
            chain.push(ic.fulfilled, ic.rejected);
        });
        while (chain.length) {
            promise = promise.then(chain.shift(), chain.shift());
        }
        return promise;
    }
    get(url, fetcherInit = {}) {
        return this.fetch({ ...fetcherInit, url, method: 'get' });
    }
    post(url, fetcherInit = {}) {
        return this.fetch({ ...fetcherInit, url, method: 'post' });
    }
    delete(url, fetcherInit = {}) {
        return this.fetch({ ...fetcherInit, url, method: 'delete' });
    }
    put(url, fetcherInit = {}) {
        return this.fetch({ ...fetcherInit, url, method: 'put' });
    }
    patch(url, fetcherInit = {}) {
        return this.fetch({ ...fetcherInit, url, method: 'patch' });
    }
    head(url, fetcherInit = {}) {
        return this.fetch({ ...fetcherInit, url, method: 'head' });
    }
    options(url, fetcherInit = {}) {
        return this.fetch({ ...fetcherInit, url, method: 'options' });
    }
    rpc(url, fetcherInit = {}) {
        return this.fetch({ ...fetcherInit, url, method: 'rpc' });
    }
}
function createInstance(config) {
    const context = new Fetcher(config);
    const instance = Fetcher.prototype.fetch.bind(context);
    ['useRequest', 'useResponse', ...methods].forEach(method => (instance[method] = Fetcher.prototype[method].bind(context)));
    instance.config = context.config;
    return instance;
}
const fetcher = createInstance({});
fetcher.create = function create(config) {
    return createInstance(config);
};
export default fetcher;
//# sourceMappingURL=Fetcher.js.map