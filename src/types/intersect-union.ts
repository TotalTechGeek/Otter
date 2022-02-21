import {RequestExtractor} from '../extract';

/**
 * Converts a union `(a | b | c)` to an intersection of the same
 * arguments `(a & b & c)`. This is restricted to `objects` so that
 * the result will never be `never`.
 *
 * Sourced from [here](https://stackoverflow.com/a/50375286).
 */
export type IntersectUnion<U extends object> =
(
    U extends any
    ? (k: U) => void
    : never
  ) extends ((k: infer I) => void)
    ? I
    : never;
