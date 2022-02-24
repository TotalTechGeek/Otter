import {ExtractionContext} from './extraction-context';

export type SimpleExtractor<TParamName extends string, TExtract extends object> = {
  paramName: TParamName;
  apply: (ctx: ExtractionContext) => TExtract;
}
