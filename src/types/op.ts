import {Awaitable} from 'src/types';

export type Op<T = any, U = any> = (input: T) => Awaitable<U>;
