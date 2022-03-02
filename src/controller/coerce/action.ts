import {Action, HttpBindingInfo, RestRoute} from 'src/controller/types';
import {ActionPipeline} from 'src/action-pipeline';

export function action<TInput extends object, TOutput>(
  {route, handler}: Action<TInput, TOutput, RestRoute<string, string>>,
): ActionPipeline<TInput, TOutput, HttpBindingInfo> {
  return new ActionPipeline(
    handler,
    { type: 'http', route }
  );
}

