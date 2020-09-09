export type SetPayload<S> = ((state: S) => Partial<S>) | Partial<S>;

export type Set<S> = (setter: SetPayload<S>) => any;
export type Get<S> = (...p: any[]) => S;

export type Actions<S, A extends { [key: string]: (...args: any[]) => any }> = (
  set: Set<S>,
  get: Get<S>,
) => A;

export type Result<S, A extends { [key: string]: (...args: any[]) => any }> = {
  set: Set<S>;
  get: Get<S>;
  subscribe: (listener: (s: S) => any) => () => any;
} & A;

export default function createStore<S, A extends { [key: string]: (...args: any[]) => any }>(
  preloadedState: S,
  actions: Actions<S, A> = (() => ({})) as any,
): Result<S, A> {
  let currentState = preloadedState;
  let currentListeners: ((s: S) => any)[] | null = [];
  let nextListeners = currentListeners;
  let isUpdating = false;

  function ensureCanMutateNextListeners() {
    if (nextListeners === currentListeners) {
      nextListeners = currentListeners.slice();
    }
  }

  function get(): S {
    if (isUpdating) {
      throw new Error();
    }

    return currentState;
  }

  function subscribe(listener: (s: S) => any) {
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

  function set(value: Partial<S> | ((v: S) => Partial<S>)) {
    if (isUpdating) {
      throw new Error('Reducers may not dispatch actions.');
    }

    try {
      isUpdating = true;
      const partialState =
        typeof value === 'function' ? (value as (v: S) => S)(currentState) : value;
      currentState = { ...currentState, ...partialState };
    } finally {
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
