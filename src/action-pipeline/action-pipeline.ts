import {Awaitable, Op} from 'src/types';

export type InvokableActionPipeline<TInput, TOutput, TBindingInfo> =
  & ((input: TInput) => Awaitable<TOutput>)
  & { bindingInfo: TBindingInfo };

export class ActionPipeline<
  TInput,
  TOutput,
  TBindingInfo,
> {
  private readonly actions = new Array<Op>();

  constructor(
    handler: (input: TInput) => Awaitable<TOutput>,
    private readonly bindingInfo: TBindingInfo,
  ) {
    this.actions.push(handler);
  }

  /**
   * Builds an asynchronous pipeline to handle incoming requests
   */
  build(): InvokableActionPipeline<TInput, TOutput, TBindingInfo> {
    const pipeline = async(input: TInput): Promise<TOutput> => {
      let intermediate: any = input;
      for (const action of this.actions) {
        intermediate = await action(intermediate);
      }
      return intermediate;
    };
    pipeline.bindingInfo = this.bindingInfo;
    return pipeline;
  }

  //
  // Warning: type funny stuff ahead!
  //

  // Need more? Open an issue

  before<T0>(
    op0: Op<T0, TInput>,
  ): ActionPipeline<T0, TOutput, TBindingInfo>;
  before<T0, T1>(
    op0: Op<T0, T1>,
    op1: Op<T1, TInput>,
  ): ActionPipeline<T0, TOutput, TBindingInfo>;
  before<T0, T1, T2>(
    op0: Op<T0, T1>,
    op1: Op<T1, T2>,
    op2: Op<T2, TInput>,
  ): ActionPipeline<T0, TOutput, TBindingInfo>;
  before<T0, T1, T2, T3>(
    op0: Op<T0, T1>,
    op1: Op<T1, T2>,
    op2: Op<T2, T3>,
    op3: Op<T3, TInput>,
  ): ActionPipeline<T0, TOutput, TBindingInfo>;
  before<T0, T1, T2, T3, T4>(
    op0: Op<T0, T1>,
    op1: Op<T1, T2>,
    op2: Op<T2, T3>,
    op3: Op<T3, T4>,
    op4: Op<T4, TInput>,
  ): ActionPipeline<T0, TOutput, TBindingInfo>;
  before(...beforeActions: Array<Op>): ActionPipeline<unknown, unknown, TBindingInfo> {
    this.actions.unshift(...beforeActions);
    return this as any;
  }

  after<T0>(
    op0: Op<TOutput, T0>,
  ): ActionPipeline<TInput, T0, TBindingInfo>;
  after<T0, T1>(
    op0: Op<TOutput, T0>,
    op1: Op<T0, T1>,
  ): ActionPipeline<TInput, T1, TBindingInfo>;
  after<T0, T1, T2>(
    op0: Op<TOutput, T0>,
    op1: Op<T0, T1>,
    op2: Op<T1, T2>,
  ): ActionPipeline<TInput, T2, TBindingInfo>;
  after<T0, T1, T2, T3>(
    op0: Op<TOutput, T0>,
    op1: Op<T0, T1>,
    op2: Op<T1, T2>,
    op3: Op<T2, T3>,
  ): ActionPipeline<TInput, T3, TBindingInfo>;
  after<T0, T1, T2, T3, T4>(
    op0: Op<TOutput, T0>,
    op1: Op<T0, T1>,
    op2: Op<T1, T2>,
    op3: Op<T2, T3>,
    op4: Op<T3, T4>,
  ): ActionPipeline<TInput, T4, TBindingInfo>;
  after(...afterActions: Array<Op>): ActionPipeline<unknown, unknown, TBindingInfo> {
    this.actions.push(...afterActions);
    return this as any;
  }
}
