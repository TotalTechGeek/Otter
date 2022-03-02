import {IntersectUnion} from '../types';
import {Extractor} from './extractor';
import {PartialExtractor} from './partial-extractor';

export function combine<TInput, TExtractors extends PartialExtractor<TInput>>(
  ...partialExtractors: Array<TExtractors>
): Extractor<TInput, IntersectUnion<ReturnType<TExtractors>>> {
  return (ctx: TInput) => {
    return partialExtractors
      .map(pe => pe(ctx))
      .reduce((acc, val) => {
        return {...acc, ...val};
      }, {}) as any;
  }
}
