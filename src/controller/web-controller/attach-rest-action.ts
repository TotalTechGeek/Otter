import {AttachActionParams} from './attach-action-params';
import {Request, Response} from 'express';

export function attachRestAction({action, app, prefix}: AttachActionParams) {
  if (action.bindingInfo.type !== 'http') return;

  const {path, method} = action.bindingInfo.route;
  const route = `${prefix}${path}`
  console.log(`Registering ${method} ${route}`)
  app[method](route, handler);

  async function handler(req: Request, res: Response) {
    try {
      const output = await action.run({ req });
      res.send(JSON.stringify(output));
    } catch (e) {
      const status = e.code ?? 500;

      console.error(e);

      res.status(status).send({
        status,
        message: e instanceof Error ? e.message : 'Internal Server Error',
        error: e
      });
    }
  }
}
