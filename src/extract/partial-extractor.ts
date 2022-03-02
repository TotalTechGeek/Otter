export type PartialExtractor<TContext, TPartial extends object = object> = (ctx: TContext) => TPartial;
