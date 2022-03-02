import {RequestExtractor, SimpleExtractor} from 'src/extract';
import {IntersectUnion} from 'src/types';

export function extract<TExtractors extends SimpleExtractor<object>>(
  ...providers: Array<TExtractors>
): RequestExtractor<IntersectUnion<ReturnType<TExtractors>>> {
  return (ctx) => {
    return providers
      .map(p => p(ctx))
      .reduce((acc, val) => {
        return {...acc, ...val};
      }, {}) as any;
  };
}
