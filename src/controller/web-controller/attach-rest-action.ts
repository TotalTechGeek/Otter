import {AttachActionParams} from './attach-action-params';
import {Request, Response} from 'express';

export function attachRestAction({action, app, prefix}: AttachActionParams) {
  if (action.route.type !== 'rest') return;

  const {path, method} = action.route;
  const route = `${prefix}${path}`
  console.log(`Registering ${method} ${route}`)
  app[method](route, handler);

  function handler(req: Request, res: Response) {
    try {
      const input = action.extract?.apply({req});
      const output = action.handler(input);
      res.send(JSON.stringify(output));
    } catch (e) {
      const status = e.code ?? 500;

      res.status(status).send({
        status,
        message: e instanceof Error ? e.message : 'Internal Server Error',
        error: e
      });
    }
  }
}
