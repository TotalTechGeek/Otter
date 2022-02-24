import {AttachActionParams} from './attach-action-params';
import {Request, Response} from 'express';

export function attachRestAction({action, app, prefix}: AttachActionParams) {
  if (action.route.type !== 'rest') return;

  const {path, method} = action.route;
  const route = `${prefix}${path}`
  console.log(`Registering ${method} ${route}`)
  app[method](route, handler);

  function handler(req: Request, res: Response) {
    const input = action.extract?.apply({ req, res });
    try {
      const output = action.handler(input);
      res.send(JSON.stringify(output));
    } catch (e) {
      if (e.code) {
        res.sendStatus(e.code);
      }

      res.send(e.toString());
    }
  }
}
