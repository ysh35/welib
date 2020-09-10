import createStore from '../store';
export default function createRequestStore(service) {
    return createStore({
        data: undefined,
        loading: false,
        error: undefined,
    }, (set, get) => ({
        async fetch(...args) {
            set({ loading: true });
            try {
                set({ data: await service(...args), loading: false });
            }
            catch (error) {
                set({ error, loading: false });
            }
        },
    }));
}
//# sourceMappingURL=requestStore.js.map