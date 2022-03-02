import {ActionPipeline} from 'src/action-pipeline';
import {HttpBindingInfo, HttpController, HttpPipelineInput} from 'src/http';

export type Controller = {
  actions: Array<ActionPipeline<HttpPipelineInput, any, HttpBindingInfo>>
}

export function controller(controller: Controller): HttpController {
  return new HttpController(controller);
}
