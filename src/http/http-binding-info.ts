import {HttpMethod} from '../types';

export type HttpBindingInfo = {
  type: 'http';
  route: {
    method: HttpMethod,
    path: string;
  };
}

