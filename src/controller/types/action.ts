import {RequestExtractor} from 'src/extract';
import {RestRoute} from './RestRoute';
import {Awaitable} from 'src/types';

export type Action =
  & ActionRoute<any>
  & ActionHandler<any>
  & ActionExtractor<any, any>;

export type ActionRoute<TRoute extends RestRoute<string, string>> = {
  route: TRoute;
}
export type ActionHandler<TInput extends object> = {
  handler: (input: TInput) => Awaitable<unknown>,
}
export type ActionExtractor<TParamName extends string, TInput extends object> = {
  extract: RequestExtractor<TParamName, TInput>,
}
