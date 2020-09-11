import useStore from '../useStore';
import createRequestStore from '../../store/requestStore';
export default function createUseRequestStore(service) {
    const store = createRequestStore(service);
    function createdUseStore(selector = (s) => s, { equalFun } = {
        equalFun: (a, b) => a === b,
    }) {
        return useStore(store, selector, { equalFun });
    }
    createdUseStore.store = store;
    return createdUseStore;
}
//# sourceMappingURL=createUseRequestStore.js.map