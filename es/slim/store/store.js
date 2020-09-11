export default function createStore(preloadedState, actions = (() => ({}))) {
    let currentState = preloadedState;
    let currentListeners = [];
    let nextListeners = currentListeners;
    let isUpdating = false;
    function ensureCanMutateNextListeners() {
        if (nextListeners === currentListeners) {
            nextListeners = currentListeners.slice();
        }
    }
    function get() {
        if (isUpdating) {
            throw new Error();
        }
        return currentState;
    }
    function subscribe(listener) {
        if (isUpdating) {
            throw new Error();
        }
        let isSubscribed = true;
        ensureCanMutateNextListeners();
        nextListeners.push(listener);
        return function unsubscribe() {
            if (!isSubscribed) {
                return;
            }
            if (isUpdating) {
                throw new Error();
            }
            isSubscribed = false;
            ensureCanMutateNextListeners();
            const index = nextListeners.indexOf(listener);
            nextListeners.splice(index, 1);
            currentListeners = null;
        };
    }
    function set(value) {
        if (isUpdating) {
            throw new Error('Reducers may not dispatch actions.');
        }
        try {
            isUpdating = true;
            const partialState = typeof value === 'function' ? value(currentState) : value;
            currentState = { ...currentState, ...partialState };
        }
        finally {
            isUpdating = false;
        }
        const listeners = (currentListeners = nextListeners);
        for (let i = 0; i < listeners.length; i++) {
            const listener = listeners[i];
            listener(currentState);
        }
    }
    return {
        set,
        get,
        subscribe,
        ...actions(set, get),
    };
}
//# sourceMappingURL=store.js.map