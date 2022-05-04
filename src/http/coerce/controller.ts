import {HttpBindingInfo, HttpController, HttpPipelineInput} from 'src/http';
import {InvokableActionPipeline} from 'src/action-pipeline';

type Action = InvokableActionPipeline<HttpPipelineInput, any, HttpBindingInfo>;

export type Controller = {
  actions: Array<Action>;
}

export function controller(controller: Controller): HttpController {
  return new HttpController(controller);
}
