import * as express from 'express';
import {json} from 'body-parser'
import {discoverControllers} from './discover-controllers';

type OtterOptions = {
  port: number
}

async function initialize(options: OtterOptions): Promise<void> {
  const app = express();
  app.use(json());

  await discoverControllers(app);

  return new Promise((resolve, reject) => {
    app.listen(options.port, resolve);
  });
}

export function otter(options: OtterOptions) {
  initialize(options)
    .then(() => {
      console.log(`[otter] Initialized and listening on port ${options.port}`)
    })
    .catch(e => {
      throw e
    });
}

