import {HttpMethod} from 'src/types';

export type Route<TRoute extends string = string, TRouteParams extends string = string> = {
  type: 'rest',
  pattern: TRoute;
  method: HttpMethod;
  path: string;
}

type RouteParams<TRoute extends string> = TRoute extends `${infer TMethod} /${infer TRest}`
  ? TMethod extends HttpMethod
    ? PathParams<never, TRest>
    : never
  : never;
type PathParams<TPathParams extends string, TPath extends string> = TPath extends `:${infer TParam}/${infer TRest}`
  ? PathParams<TPathParams | TParam, TRest>
  : TPath extends `:${infer TParam}`
    ? TPathParams | TParam
    : TPath extends `${infer _StaticPath}/${infer TRest}`
      ? PathParams<TPathParams, TRest>
      : TPathParams;

export function route<TRoute extends string>(route: TRoute): Route<TRoute, RouteParams<TRoute>> {
  const [method, path] = route.split(' ');
  if (!HttpMethod.includes(method)) {
    throw new Error(`Illegal HttpMethod: ${method}`);
  }

  return {
    type: 'rest',
    pattern: route,
    method,
    path
  };
}
