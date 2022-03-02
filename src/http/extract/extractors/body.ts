import {Schema, ObjectProperties} from 'src/schema';
import {HttpError} from 'src/http';
import {HttpPartialExtractor} from 'src/http/extract/http-partial-extractor';

import Ajv from 'ajv';

const ajv = new Ajv();

export function body<T extends object>(schema: ObjectProperties<T>): HttpPartialExtractor<T> {
  const isValid = ajv.compile(Schema.object(schema).specification);

  return (ctx) => {
    if (!isValid(ctx.req.body)) {
      throw new HttpError('Request Failed Validation', 400, isValid.errors)
    }

    return ctx.req.body as any;
  };
}
