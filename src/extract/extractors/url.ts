import {SimpleExtractor} from 'src/extract';

export function url<TParamName extends string>(param: TParamName):
  SimpleExtractor<TParamName, { [Key in TParamName]: string }> {
  throw 'todo';
}

