import {ActionPipeline, InvokableActionPipeline} from 'src/action-pipeline';
import * as e from 'express';

import {Controller} from './coerce';
import {HttpBindingInfo} from './http-binding-info';
import {HttpPipelineInput} from './http-pipeline-input';

export class HttpController {
  constructor(private readonly definition: Controller) {
  }

  register(app: e.Express, prefix: string) {
    this.definition.actions.forEach(action => bind(action));

    function bind(action: InvokableActionPipeline<HttpPipelineInput, any, HttpBindingInfo>) {
      if (action.bindingInfo.type !== 'http') return;

      const {path, method} = action.bindingInfo.route;
      const route = `${prefix}${path}`
      console.log(`Registering ${method} ${route}`)
      app[method](route, async (req: e.Request, res: e.Response) => {
        try {
          const output = await action({ req });
          res.send(JSON.stringify(output));
        } catch (e) {
          console.error(`[${method} ${route}] Unhandled exception:`);
          console.error(e);

          const status = (e as any).code ?? 500;
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
