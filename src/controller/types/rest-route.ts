import {HttpMethod} from 'src/types';

export type RestRoute<TRoute extends string, TRouteParams extends string> = {
  type: 'rest',
  pattern: TRoute;
  method: HttpMethod;
  path: string;
}

