import {SimpleExtractor} from 'src/extract';

export function url<TParamName extends string>(param: TParamName):
  SimpleExtractor<TParamName, { [Key in TParamName]: string }> {
  return {
    paramName: param,
    apply: (ctx) => {
      return {
        [param]: ctx.req.params[param]
      } as {
        [Key in TParamName]: string
      };
    }
  };
}

