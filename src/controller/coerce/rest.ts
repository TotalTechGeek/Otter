import {HttpMethod} from 'src/types';
import {RestRoute} from 'src/controller/RestRoute';

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
  throw 'TODO';
}
