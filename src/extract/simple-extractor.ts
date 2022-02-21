export type SimpleExtractor<TParamName extends string, TExtract extends object> = {
  paramName: TParamName;
  apply: () => TExtract;
}
