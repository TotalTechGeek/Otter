import * as express from 'express';
import { json } from 'body-parser'

type OtterOptions = {
  port: number
}

export async function otter(options: OtterOptions): Promise<void> {
  const app = express();
  app.use(json());

  return new Promise((resolve, reject) => {
    app.listen(options.port, () => {
      resolve();
    });
  });
}

