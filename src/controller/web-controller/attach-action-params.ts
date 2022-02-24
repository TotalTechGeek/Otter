import {Action} from '../types';
import {Express} from 'express';

export type AttachActionParams = {
  app: Express,
  prefix: string,
  action: Action,
};