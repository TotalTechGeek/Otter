
export type AjvBaseOptions<TOptions, TOptional extends boolean> = {
  not?: Exclude<TOptions, 'not'>;
  oneOf?: Array<Partial<TOptions>>;
  anyOf?: Array<Partial<TOptions>>;
  allOf?: Array<Partial<TOptions>>;

  optional?: TOptional;
} & TOptions;
