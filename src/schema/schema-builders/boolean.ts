import {AjvBaseOptions, otterSchema} from '../types';

type BooleanSchemaOptions<TOptional extends boolean> = AjvBaseOptions<{}, TOptional>

export function boolean<TOptional extends boolean = false>(options?: BooleanSchemaOptions<TOptional>) {
  return otterSchema<boolean, TOptional>({
    type: 'boolean',
    ...options
  });
}
