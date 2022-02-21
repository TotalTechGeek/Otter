import {SimpleExtractor} from 'src/extract';

export function body<TExtract extends object>(): SimpleExtractor<never, TExtract> {
  throw 'todo';
}
