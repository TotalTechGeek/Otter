import {SimpleExtractor} from 'src/extract';
import {Schema} from 'src/schema';
import {ObjectProperties} from 'src/schema/schema-builders';

import Ajv, {ValidateFunction} from 'ajv';
const ajv = new Ajv();

export function body<
  T extends object,
>(schema: ObjectProperties<T>): SimpleExtractor<never, T> {
  let validator: ValidateFunction | undefined;

  return {
    apply: () => {
      if (!validator) {
        validator = ajv.compile(Schema.object(schema).specification);
      }

      // TODO validate body
      return null as any;
    }
  } as any;
}
