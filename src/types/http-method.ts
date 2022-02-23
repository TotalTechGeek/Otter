
const values = Object.freeze([
  'delete',
  'get',
  'patch',
  'post',
  'put'
] as const);

export type HttpMethod = typeof values[number];
export const HttpMethod = Object.freeze({
  values: values,
  includes(value: string): value is HttpMethod {
    return HttpMethod.values.includes(value as any);
  }
});
