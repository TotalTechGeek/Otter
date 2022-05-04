import {AjvBaseOptions, otterSchema, OtterSchema} from '../types';
import {string} from './string';

export type ObjectProperties<T> = {
  [K in keyof T]: OtterSchema<T[K]>
}

type ObjectOptions<TOptional extends boolean> = AjvBaseOptions<{
  maxProperties?: number;
  minProperties?: number;
  patternProperties?: Record<string, OtterSchema<unknown>>;
  additionalProperties?: boolean;
}, TOptional>;

export function object<TType, TOptional extends boolean = false>(
  properties: ObjectProperties<TType>,
  options?: ObjectOptions<TOptional>
): OtterSchema<TOptional extends true ? TType | undefined : TType> {
  const required = getRequired(properties);
  return otterSchema({
    type: 'object',
    properties: extractSpecification(properties),
    required,

    // default properties
    additionalProperties: false,

    ...options,
  })
}

function getRequired<T>(properties: ObjectProperties<T>): Array<string> {
  function reducer(
    required: Array<string>,
    entry: [string, unknown],
  ): Array<string> {
    const [propName, propSchema] = entry as [string, OtterSchema<unknown>];

    if (!propSchema.optional) {
      required.push(propName);
    }

    delete propSchema.optional;
    return required;
  }

  return Object
    .entries(properties)
    .reduce(reducer, []);
}

function extractSpecification<T>(properties: ObjectProperties<T>) {
  return Object
    .entries(properties)
    .map(([key, value]) => {
      return [
        key,
        (value as OtterSchema<unknown>).specification
      ] as [
        string,
        OtterSchema<unknown>['specification']
      ]
    })
    .reduce((acc, [key, value]) => {
      return { ...acc, [key]: value };
    }, {});
}