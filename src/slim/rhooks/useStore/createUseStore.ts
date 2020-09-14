import useStore from './useStore';
import createStore from '../../store';

export type SetPayload<S> = ((state: S) => Partial<S>) | Partial<S>;

export type Set<S> = (setter: SetPayload<S>) => any;
export type Get<S> = (...p: any[]) => S;

export type Actions<S, A extends { [key: string]: (...args: any[]) => any }> = (
  set: Set<S>,
  get: Get<S>,
) => A;

export default function createUseStore<
  S,
  A extends { [key: string]: (...args: any[]) => any }
>(preloadedState: S, actions: Actions<S, A> = (() => ({})) as any) {
  const store = createStore(preloadedState, actions);

  function createdUseStore<R = S>(
    selector: (s: S) => R = (s: S) => (s as unknown) as R,
    { equalFun }: { equalFun: (prev: R, next: R) => boolean } = {
      equalFun: (a, b) => a === b,
    },
  ) {
    return useStore(store, selector, { equalFun });
  }

  createdUseStore.store = store;
  Object.assign(createdUseStore, store);
  return createdUseStore;
}
