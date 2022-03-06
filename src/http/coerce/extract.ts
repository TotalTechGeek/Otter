import {IntersectUnion} from 'src/types';
import {Extractor, PartialExtractor} from 'src/extract';
import {HttpPipelineInput} from 'src/http';

export function extract<
  TInput extends HttpPipelineInput,
  T0 extends object,
>(
  p0: PartialExtractor<TInput, T0>,
): Extractor<TInput, T0>
export function extract<
  TInput extends HttpPipelineInput,
  T0 extends object,
  T1 extends object,
  >(
  p0: PartialExtractor<TInput, T0>,
  p1: PartialExtractor<TInput, T1>,
): Extractor<TInput, T0 & T1>

export function extract(...args: Array<PartialExtractor<any, any>>): Extractor<any, any> {
  return (ctx) => {
    return args
      .map(p => p(ctx))
      .reduce((acc, val) => {
        return {...acc, ...val};
      }, {}) as any;
  };
}
