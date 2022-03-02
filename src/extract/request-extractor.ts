import {HttpInput, Op} from '../action-pipeline';

export type RequestExtractor<TOutput> = Op<HttpInput, TOutput>
