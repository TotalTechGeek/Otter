import {Extractor} from '../../extract';
import {HttpPipelineInput} from 'src/http';

export type HttpExtractor<TOutput> = Extractor<HttpPipelineInput, TOutput>