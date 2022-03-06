import {Schema, ObjectProperties} from 'src/schema';
import {PartialExtractor} from 'src/extract';
import {HttpError, HttpPipelineInput} from 'src/http';

import Ajv from 'ajv';

const ajv = new Ajv();

export function body<T extends object>(schema: ObjectProperties<T>): PartialExtractor<HttpPipelineInput, T> {
  const isValid = ajv.compile(Schema.object(schema).specification);

  return (ctx) => {
    if (!isValid(ctx.req.body)) {
      throw new HttpError('Request Failed Validation', 400, isValid.errors)
    }

    return ctx.req.body as any;
  };
}
