import {SimpleExtractor} from 'src/extract';
import {Schema} from 'src/schema';
import {ObjectProperties} from 'src/schema/schema-builders';

export function body<
  T extends object,
>(schema: ObjectProperties<T>): SimpleExtractor<never, T> {
  throw 'todo';
}
