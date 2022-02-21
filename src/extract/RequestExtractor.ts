export type RequestExtractor<TParamName extends string, TOutput> = {
  paramName?: TParamName,
  apply: () => TOutput
}
