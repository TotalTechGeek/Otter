export type HttpMethod = 'delete' | 'get' | 'patch' | 'post' | 'put';

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

export type Route<TRoute extends string, TRouteParams extends string> = {
  pattern: TRoute;
  params: Array<TRouteParams>;
}

export function route<TRoute extends string>(route: TRoute): Route<TRoute, RouteParams<TRoute>> {
  throw 'TODO';
}
