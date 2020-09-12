import { useEffect, useReducer, useRef } from 'react';
export default function useStore(store, selector = (s) => s, { equalFun } = { equalFun: (a, b) => a === b }) {
    const [, forceRender] = useReducer(s => s + 1, 0);
    const refLastState = useRef(store.get());
    useEffect(() => {
        const unsubscribe = store.subscribe(currentState => {
            if (equalFun(selector(currentState), selector(refLastState.current))) {
                return;
            }
            refLastState.current = currentState;
            forceRender();
        });
        return () => unsubscribe();
    }, []);
    return selector(store.get());
}
//# sourceMappingURL=useStore.js.map