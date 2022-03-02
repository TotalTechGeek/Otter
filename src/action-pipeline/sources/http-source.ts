import {ActionSource} from './action-source';
import * as e from 'express';

export type HttpPipelineInput = {
  req: e.Request;
  res: e.Response;
};

export type HttpInput = {
  req: e.Request;
};

export const HttpSource: ActionSource<HttpPipelineInput, HttpInput> = ({ req }: HttpPipelineInput) => {
  return { req };
}
