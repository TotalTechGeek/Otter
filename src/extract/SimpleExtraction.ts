export type SimpleExtraction<TParamName extends string,
  TExtract extends object> = {
  paramName?: TParamName;
  apply: () => TExtract;
}
