import {HttpController, HttpPipelineInput} from 'src/http';
import {Awaitable} from 'src/types';

type Action = (input: HttpPipelineInput) => Awaitable;

export type Controller = {
  actions: Array<Action>;
}

export function controller(controller: Controller): HttpController {
  return new HttpController(controller);
}
