import {Action, ActionExtractor, ActionHandler, ActionRoute, RestRoute} from 'src/controller/types';
import {RequestExtractor} from 'src/extract';

export function action<TInput extends object,
  TExtracted extends TInput,
  TParamName extends string,
  TRoute extends RestRoute<string, TParamName>,
  TRequestExtractor extends RequestExtractor<TParamName, TExtracted>,
  >(
  action: ActionHandler<TInput>
    & ActionExtractor<TParamName, TExtracted>
    & ActionRoute<TRoute>
): Action
export function action<TRoute extends RestRoute<string, never>>(
  action: ActionHandler<never>
    & ActionRoute<TRoute>
): Action;
export function action(action: any): Action {
  return action;
}

