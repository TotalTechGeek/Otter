import {SimpleExtractor} from 'src/extract';

export function url<T extends string>(param: T): SimpleExtractor<Record<T, string>> {
  return (ctx) => {
    return {
      [param]: ctx.req.params[param]
    } as Record<T, string>;
  };
}

