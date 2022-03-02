import {PartialExtractor} from 'otter/extract';
import {HttpPipelineInput} from 'otter/http';
import {Authenticated} from '../../pipeline';

export function authentication(): PartialExtractor<
  Authenticated<HttpPipelineInput>,
  Authenticated<HttpPipelineInput>['authenticated']
> {
  return (ctx) => {
    return ctx.authenticated;
  }
}
