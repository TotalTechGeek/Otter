import * as express from 'express';
import { json } from 'body-parser'

type OtterOptions = {
  port: number
}

export function otter(options: OtterOptions) {
  const app = express();
  app.use(json());

  app.listen(options.port, () => {
    console.log(`[otter] Initialized and listening on port ${options.port}`)
  });
}

