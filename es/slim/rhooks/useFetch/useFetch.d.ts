import { Service, Options, Result } from './types';
export default function useFetch<D, P extends any[] = any[], E extends Error & {
    isTimeoutError: boolean;
} = Error & {
    isTimeoutError: boolean;
}>(service: Service<D, P>, option?: Options<D, P>): Result<D, P>;
