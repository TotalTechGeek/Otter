import {AjvBaseOptions, otterSchema} from '../types';

type NumberSchemaOptions<TOptional extends boolean> = AjvBaseOptions<{
  minimum?: number;
  maximum?: number;
  exclusiveMaximum?: number;
  exclusiveMinimum?: number;
  multipleOf?: number;
}, TOptional>

export function number<TOptional extends boolean = false>(options?: NumberSchemaOptions<TOptional>) {
  return otterSchema<number, TOptional>({
    type: 'number',
    ...options
  });
}
