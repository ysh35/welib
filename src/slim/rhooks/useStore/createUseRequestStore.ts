import useStore from '../useStore';

import createRequestStore from '../../store/requestStore';

export type SetPayload<S> = ((state: S) => Partial<S>) | Partial<S>;

export type Set<S> = (setter: SetPayload<S>) => any;
export type Get<S> = (...p: any[]) => S;

export type Actions<S, A extends { [key: string]: (...args: any[]) => any }> = (
  set: Set<S>,
  get: Get<S>,
) => A;

type Service<D, P extends any[]> = (...p: P) => Promise<D>;

type S<D> = {
  data: undefined | D;
  loading: boolean;
  error: undefined | Error;
};

export default function createUseRequestStore<D, P extends any[]>(service: Service<D, P>) {
  const store = createRequestStore<D, P>(service);

  function createdUseStore<R = S<D>>(
    selector: (s: S<D>) => R = (s: S<D>) => (s as unknown) as R,
    { equalFun }: { equalFun: (prev: R, next: R) => boolean } = {
      equalFun: (a, b) => a === b,
    },
  ) {
    return useStore(store, selector, { equalFun });
  }
  createdUseStore.store = store;
  return createdUseStore;
}
