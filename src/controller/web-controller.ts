import {Controller} from './types';
import {Express} from 'express';

export class WebController {
  constructor(private readonly definition: Controller) {
  }

  register(app: Express, prefix: string) {
    this.registerRestRoutes(app, prefix);
  }

  private registerRestRoutes(app: Express, prefix: string) {
    this.definition
      .actions
      .filter(a => a.route.type === 'rest')
      .forEach(action => {
        const [method, route] = action.route.pattern.split(' ')
        const fullRoute = `${prefix}/${route}`;

        app[method](fullRoute, (req, res) => {
          console.log(`Just hit ${method} ${fullRoute}`)
        });
      });
  }
}