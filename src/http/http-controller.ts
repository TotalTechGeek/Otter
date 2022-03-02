import {Controller} from './coerce';
import {HttpBindingInfo} from './http-binding-info';
import {ActionPipeline, HttpInput} from 'src/action-pipeline';
import * as e from 'express';

export class HttpController {
  constructor(private readonly definition: Controller) {
  }

  register(app: e.Express, prefix: string) {
    this.definition.actions.forEach(bindAction);

    function bindAction(action: ActionPipeline<HttpInput, any, HttpBindingInfo>) {
      if (action.bindingInfo.type !== 'http') return;

      const {path, method} = action.bindingInfo.route;
      const route = `${prefix}${path}`
      console.log(`Registering ${method} ${route}`)
      app[method](route, async (req: e.Request, res: e.Response) => {
        try {
          const output = await action.run({ req });
          res.send(JSON.stringify(output));
        } catch (e) {
          console.error(`[${method} ${route}] Unhandled exception:`);
          console.error(e);

          const status = e.code ?? 500;
          res.status(status).send({
            status,
            message: e instanceof Error ? e.message : 'Internal Server Error',
            error: e
          });
        }
      });
    }
  }
}
