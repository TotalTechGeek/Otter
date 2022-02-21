import {AjvBaseOptions, otterSchema} from '../types';

type StringSchemaOptions<TOptional extends boolean> = AjvBaseOptions<{
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  format?: string;
}, TOptional>

export function string<TOptional extends boolean = false>(options?: StringSchemaOptions<TOptional>) {
  return otterSchema<string, TOptional>({
    type: 'string',
    ...options
  });
}
