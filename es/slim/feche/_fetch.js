export default function _fetch(fecheOptions) {
    let timer = 0;
    let abortController = fecheOptions.abortController;
    let signal = fecheOptions.signal;
    // if timeout
    if (fecheOptions.timeout) {
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
            }, fecheOptions.timeout);
        }
    }
    // rebind abort and signal to options
    fecheOptions.abortController = abortController;
    fecheOptions.signal = signal;
    // native fetch
    return fetch(fecheOptions.url, fecheOptions).then(
    // @ts-ignore
    (response) => {
        // Response as FecheResponse
        // clear timeout timer
        if (timer) {
            clearTimeout(timer);
            timer = 0;
        }
        response.fecheOptions = fecheOptions;
        return response.text().then((data) => {
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
        }, (error) => {
            error.response = response;
            return Promise.reject(error);
        });
    }, error => {
        if (error.name === 'AbortError') {
            error.isAbortError = true;
            // check if abort by cancel or timeout
            error.isTimeoutError = fecheOptions.abortController ? !timer : false;
        }
        // clear timeout timer
        if (timer) {
            clearTimeout(timer);
            timer = 0;
        }
        return Promise.reject(error);
    });
}
//# sourceMappingURL=_fetch.js.map