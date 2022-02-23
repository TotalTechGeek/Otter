import {RequestExtractor, SimpleExtractor} from 'src/extract';
import {IntersectUnion} from 'src/types';

export function extract<TExtractors extends SimpleExtractor<string, object>>(
  providers: Array<TExtractors>
): RequestExtractor<
    TExtractors['paramName'],
    IntersectUnion<ReturnType<TExtractors['apply']>>
    >
{
  return {
    apply: () => {
      return providers
        .map(p => p.apply())
        .reduce((acc, val) => {
          return { ...acc, ...val };
        }, {}) as any;
    }
  };
}