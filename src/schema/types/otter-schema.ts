import {AjvBaseOptions} from './ajv-base-options';

export type OtterSchema<T> = {
  type?: T;
  optional?: boolean;
  specification: AjvBaseOptions<unknown, boolean>;
}

export function otterSchema<TType, TOptional extends boolean>(
  specification: AjvBaseOptions<any, TOptional>
): OtterSchema<TOptional extends true ? TType | undefined : TType> {
  const optional = specification.optional;
  delete specification.optional;

  return {
    optional,
    specification: specification
  }
}