import {ActionPipeline, HttpInput} from 'src/action-pipeline';
import {RestRoute} from './rest-route';

export type HttpBindingInfo = {
  type: 'http';
  route: RestRoute<any, any>;
}

export type Controller = {
  actions: Array<ActionPipeline<HttpInput, any, HttpBindingInfo>>
}

