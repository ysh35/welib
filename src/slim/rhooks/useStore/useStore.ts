import { useEffect, useReducer, useRef } from 'react';
import { Result } from '../../store';

export default function useStore<
  S,
  A extends { [key: string]: (...args: any[]) => any },
  R = S
>(
  store: Result<S, A>,
  selector: (s: S) => R = (s: S) => (s as unknown) as R,
  { equalFun }: { equalFun: (prev: R, next: R) => boolean } = { equalFun: (a, b) => a === b },
) {
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

  return selector(store.get()) as R;
}
