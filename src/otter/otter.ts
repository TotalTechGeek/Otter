import {HttpOptions, startHttpServer} from 'src/http/startup';

type OtterOptions = {
  http?: HttpOptions
}

async function initialize(options: OtterOptions): Promise<void> {
  if (options.http) await startHttpServer(options.http);
}

export function otter(options: OtterOptions) {
  initialize(options)
    .catch(e => {
      throw e
    });
}

