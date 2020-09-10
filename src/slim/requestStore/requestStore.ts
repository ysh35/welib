import createStore from '../store';

type Service<D, P extends any[]> = (...p: P) => Promise<D>;

export default function createRequestStore<D, P extends any[]>(service: Service<D, P>) {
  return createStore(
    {
      data: undefined as undefined | D,
      loading: false,
      error: undefined as undefined | Error,
    },
    (set, get) => ({
      async fetch(...args: P) {
        set({ loading: true });
        try {
          set({ data: await service(...args), loading: false });
        } catch (error) {
          set({ error, loading: false });
        }
      },
    }),
  );
}
