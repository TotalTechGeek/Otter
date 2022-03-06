import {Awaitable} from 'src/types';

type Op<T, U> = (input: T) => Awaitable<U>;

export class ActionPipeline<
  TInput,
  TOutput,
  TBindingInfo,
> {
  private readonly actions = new Array<Op<any, any>>();

  constructor(
    handler: (input: TInput) => Awaitable<TOutput>,
    public readonly bindingInfo: TBindingInfo,
  ) {
    this.actions.push(handler);
  }

  /**
   * Asynchronously runs the pipeline on the provided `input`.
   *
   * @param input
   */
  async run(input: TInput): Promise<TOutput> {
    let intermediate: any = input;
    for (const action of this.actions) {
      intermediate = await action(intermediate);
    }
    return intermediate;
  }

  //
  // Warning: type funny stuff ahead!
  //

  // Need more? Open an issue

  before<T0, T1 extends TInput>(
    op0: Op<T0, T1>,
  ): ActionPipeline<T0, TOutput, TBindingInfo>;
  before<T0, T1, T2 extends TInput>(
    op0: Op<T0, T1>,
    op1: Op<T1, T2>,
  ): ActionPipeline<T0, TOutput, TBindingInfo>;
  before<T0, T1, T2, T3 extends TInput>(
    op0: Op<T0, T1>,
    op1: Op<T1, T2>,
    op2: Op<T2, T3>,
  ): ActionPipeline<T0, TOutput, TBindingInfo>;
  before<T0, T1, T2, T3, T4 extends TInput>(
    op0: Op<T0, T1>,
    op1: Op<T1, T2>,
    op2: Op<T2, T3>,
    op3: Op<T3, T4>,
  ): ActionPipeline<T0, TOutput, TBindingInfo>;
  before<T0, T1, T2, T3, T4, T5 extends TInput>(
    op0: Op<T0, T1>,
    op1: Op<T1, T2>,
    op2: Op<T2, T3>,
    op3: Op<T3, T4>,
    op4: Op<T3, T5>,
  ): ActionPipeline<T0, TOutput, TBindingInfo>;
  before(...beforeActions: Array<Op<any, any>>): ActionPipeline<unknown, unknown, TBindingInfo> {
    this.actions.unshift(...beforeActions);
    return this;
  }

  after<T0 extends TOutput, T1>(
    op0: Op<T0, T1>,
  ): ActionPipeline<TInput, T1, TBindingInfo>;
  after<T0 extends TOutput, T1, T2>(
    op0: Op<T0, T1>,
    op1: Op<T1, T2>,
  ): ActionPipeline<TInput, T2, TBindingInfo>;
  after<T0 extends TOutput, T1, T2, T3>(
    op0: Op<T0, T1>,
    op1: Op<T1, T2>,
    op2: Op<T2, T3>,
  ): ActionPipeline<TInput, T3, TBindingInfo>;
  after<T0 extends TOutput, T1, T2, T3, T4>(
    op0: Op<T0, T1>,
    op1: Op<T1, T2>,
    op2: Op<T2, T3>,
    op3: Op<T3, T4>,
  ): ActionPipeline<TInput, T4, TBindingInfo>;
  after<T0 extends TOutput, T1, T2, T3, T4, T5>(
    op0: Op<T0, T1>,
    op1: Op<T1, T2>,
    op2: Op<T2, T3>,
    op3: Op<T3, T4>,
    op4: Op<T3, T5>,
  ): ActionPipeline<TInput, T5, TBindingInfo>;
  after(...afterActions: Array<Op<any, any>>): ActionPipeline<unknown, unknown, TBindingInfo> {
    this.actions.push(...afterActions);
    return this;
  }
}
