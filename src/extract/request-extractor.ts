import {ExtractionContext} from './extraction-context';

export type RequestExtractor<TParamName extends string, TOutput> = {
  paramName?: TParamName,
  apply: (ctx: ExtractionContext) => TOutput
}
