export type RestRoute<TRoute extends string, TRouteParams extends string> = {
  type: 'rest',
  pattern: TRoute;
  params: Array<TRouteParams>;
}

