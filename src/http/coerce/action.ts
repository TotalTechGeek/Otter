import {ActionPipeline} from 'src/action-pipeline';
import {Route} from './route';
import {Awaitable} from 'src/types';
import {HttpBindingInfo} from 'src/http';

export type Action<
  TInput extends object,
  TOutput,
  TRoute extends Route
  > = {
  route: TRoute;
  handler: (input: TInput) => Awaitable<TOutput>,
}
export function action<TInput extends object, TOutput>(
  {route, handler}: Action<TInput, TOutput, Route>,
): ActionPipeline<TInput, TOutput, HttpBindingInfo> {
  return new ActionPipeline(
    handler,
    { type: 'http', route }
  );
}

