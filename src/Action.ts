import {Route} from './Route';
import {RequestExtractor} from './Extract';

type Awaitable<T> = T | PromiseLike<T>;

export type Action =
  & ActionRoute<any>
  & ActionHandler<any>
  & ActionExtractor<any, any>;

type ActionRoute<TRoute extends Route<string, string>> = {
  route: TRoute;
}
type ActionHandler<TInput extends object> = {
  handler: (input: TInput) => Awaitable<unknown>,
}
type ActionExtractor<TParamName extends string, TInput extends object> = {
  extract: RequestExtractor<TParamName, TInput>,
}

export function action<
  TInput extends object,
  TExtracted extends TInput,
  TParamName extends string,
  TRoute extends Route<string, TParamName>,
  TRequestExtractor extends RequestExtractor<TParamName, TExtracted>,
  >(
  action: ActionHandler<TInput>
    & ActionExtractor<TParamName, TExtracted>
    & ActionRoute<TRoute>
): Action {
  return action as any;
}

