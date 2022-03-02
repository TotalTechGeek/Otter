import {ExtractionContext} from './extraction-context';

export type SimpleExtractor<TExtract extends object> = (ctx: ExtractionContext) => TExtract;
