import {IntersectUnion} from 'src/types';
import {HttpExtractor, HttpPartialExtractor} from 'src/http/extract';

export function extract<TExtractors extends HttpPartialExtractor>(
  ...providers: Array<TExtractors>
): HttpExtractor<IntersectUnion<ReturnType<TExtractors>>> {
  return (ctx) => {
    return providers
      .map(p => p(ctx))
      .reduce((acc, val) => {
        return {...acc, ...val};
      }, {}) as any;
  };
}
