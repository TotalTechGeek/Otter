import {PartialExtractor} from 'src/extract';
import {HttpPipelineInput} from 'src/http';

export type HttpPartialExtractor<TPartial extends object = object> = PartialExtractor<HttpPipelineInput, TPartial>;