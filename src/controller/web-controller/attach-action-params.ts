import {HttpBindingInfo} from '../types';
import {Express} from 'express';
import {ActionPipeline, HttpInput} from 'src/action-pipeline';

export type AttachActionParams = {
  app: Express,
  prefix: string,
  action: ActionPipeline<HttpInput, any, HttpBindingInfo>
};