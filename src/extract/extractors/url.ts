import {SimpleExtraction} from 'src/extract/SimpleExtraction';

export function url<TParamName extends string>(param: TParamName):
  SimpleExtraction<TParamName, { [Key in TParamName]: string }> {
  throw 'todo';
}

