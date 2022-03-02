import {SimpleExtractor} from 'src/extract';
import {Schema} from 'src/schema';
import {ObjectProperties} from 'src/schema/schema-builders';

import Ajv from 'ajv';
import {HttpError} from 'otter';

const ajv = new Ajv();

export function body<T extends object>(schema: ObjectProperties<T>): SimpleExtractor<T> {
  const isValid = ajv.compile(Schema.object(schema).specification);

  return (ctx) => {
    if (!isValid(ctx.req.body)) {
      throw new HttpError('Request Failed Validation', 400, isValid.errors)
    }

    return ctx.req.body as any;
  };
}
