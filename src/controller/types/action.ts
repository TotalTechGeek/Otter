import {Awaitable} from 'src/types';
import {RestRoute} from '.';

export type Action<
  TInput extends object,
  TOutput,
  TRoute extends RestRoute<string, string>
> = {
    route: TRoute;
    handler: (input: TInput) => Awaitable<TOutput>,
}
