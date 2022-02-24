import {Controller} from 'src/controller/types';
import {Express} from 'express';
import {attachRestAction} from './attach-rest-action';

export class WebController {
  constructor(private readonly definition: Controller) {
  }

  register(app: Express, prefix: string) {
    this.definition.actions.forEach(action => {
      attachRestAction({ action, app, prefix });
    });
  }
}
