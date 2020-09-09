import { Result } from '../../store';
export default function useStore<S, A extends {
    [key: string]: (...args: any[]) => any;
}, R = S>(store: Result<S, A>, selector?: (s: S) => R, { equalFun }?: {
    equalFun: (prev: R, next: R) => boolean;
}): R;
