import {AjvBaseOptions, otterSchema, OtterSchema} from '../types';
import {object} from './object';
import {string} from './string';

type ArrayOptions<TOptional extends boolean> = AjvBaseOptions<{
  maxItems?: number;
  minItems?: number;
  uniqueItems?: boolean;
}, TOptional>;

export function array<TType, TOptional extends boolean = false>(
  elements: OtterSchema<TType>,
  options?: ArrayOptions<TOptional>
): OtterSchema<TOptional extends true ? TType[] | undefined : TType[]> {
  return otterSchema({
    type: 'array',
    items: elements.specification,
    ...options,
  });
}

const a = array(object({
  hello: string(),
  world: string({ optional: true })
}));
