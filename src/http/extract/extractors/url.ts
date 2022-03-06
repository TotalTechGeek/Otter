import {PartialExtractor} from 'src/extract';
import {HttpPipelineInput} from 'src/http';

export function url<
  TInput extends HttpPipelineInput,
  TParam extends string
>(param: TParam): PartialExtractor<
  TInput,
  { [K in TParam]: string }
> {
  return (ctx) => {
    return {
      [param]: ctx.req.params[param]
    } as {
      [K in TParam]: string
    };
  };
}

