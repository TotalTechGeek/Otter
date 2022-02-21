import {SimpleExtraction} from 'src/extract/SimpleExtraction';
import {RequestExtractor} from 'src/extract/RequestExtractor';
import {IntersectUnion} from 'src/types';

export function extract<
  TExtractors extends SimpleExtraction<string, object>
  >(providers: Array<TExtractors>):
  RequestExtractor<
    TExtractors['paramName'],
    IntersectUnion<ReturnType<TExtractors['apply']>>
    > {
  throw 'TODO';
}
