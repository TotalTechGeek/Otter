import {HttpPartialExtractor} from 'src/http/extract/http-partial-extractor';

export function url<T extends string>(param: T): HttpPartialExtractor<Record<T, string>> {
  return (ctx) => {
    return {
      [param]: ctx.req.params[param]
    } as Record<T, string>;
  };
}

