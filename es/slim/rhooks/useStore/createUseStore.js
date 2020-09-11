import useStore from './useStore';
import createStore from '../../store';
export default function createUseStore(preloadedState, actions = (() => ({}))) {
    const store = createStore(preloadedState, actions);
    function createdUseStore(selector = (s) => s, { equalFun } = {
        equalFun: (a, b) => a === b,
    }) {
        return useStore(store, selector, { equalFun });
    }
    createdUseStore.store = store;
    return createdUseStore;
}
//# sourceMappingURL=createUseStore.js.map