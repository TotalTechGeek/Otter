import {PartialExtractor} from 'otter/extract';
import {HttpPipelineInput} from 'otter/http';
import {Authentication} from '../../pipeline';

export function authentication(): PartialExtractor<
  HttpPipelineInput & Authentication,
  Authentication['authenticated']
> {
  return (ctx) => {
    return ctx.authenticated;
  }
}
