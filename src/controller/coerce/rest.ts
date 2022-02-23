import {HttpMethod} from 'src/types';
import {RestRoute} from 'src/controller/types';

type RestRouteParams<TRoute extends string> = TRoute extends `${infer TMethod} /${infer TRest}`
  ? TMethod extends HttpMethod
    ? RestPathParams<never, TRest>
    : never
  : never;
type RestPathParams<TPathParams extends string, TPath extends string> = TPath extends `:${infer TParam}/${infer TRest}`
  ? RestPathParams<TPathParams | TParam, TRest>
  : TPath extends `:${infer TParam}`
    ? TPathParams | TParam
    : TPath extends `${infer _StaticPath}/${infer TRest}`
      ? RestPathParams<TPathParams, TRest>
      : TPathParams;

export function rest<TRoute extends string>(route: TRoute): RestRoute<TRoute, RestRouteParams<TRoute>> {
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
