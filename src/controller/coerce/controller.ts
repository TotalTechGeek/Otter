import {Controller} from 'src/controller/types';
import {WebController} from 'src/controller';

export function controller(controller: Controller): WebController {
  return new WebController(controller);
}
