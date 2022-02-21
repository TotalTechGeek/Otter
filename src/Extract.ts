type Intersect<U> =
  (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never

type SimpleExtraction<TParamName extends string,
  TExtract extends object> = {
  paramName?: TParamName;
  apply: () => TExtract;
}

export type RequestExtractor<TParamName extends string, TOutput> = {
  paramName?: TParamName,
  apply: () => TOutput
}

export function extract<
  TExtractors extends SimpleExtraction<string, object>
>(providers: Array<TExtractors>):
  RequestExtractor<
    TExtractors['paramName'],
    Intersect<ReturnType<TExtractors['apply']>>
  > {
  throw 'TODO';
}


export namespace Extract {
  export namespace from {
    export function url<TParamName extends string>(param: TParamName):
      SimpleExtraction<TParamName, { [Key in TParamName]: string }> {
      throw 'todo';
    }

    export function body<TExtract extends object>(): SimpleExtraction<never, TExtract> {
      throw 'todo';
    }
  }
}
