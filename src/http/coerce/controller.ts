import {HttpBindingInfo, HttpController} from 'src/http';
import {ActionPipeline, HttpInput} from '../../action-pipeline';

export type Controller = {
  actions: Array<ActionPipeline<HttpInput, any, HttpBindingInfo>>
}

export function controller(controller: Controller): HttpController {
  return new HttpController(controller);
}
