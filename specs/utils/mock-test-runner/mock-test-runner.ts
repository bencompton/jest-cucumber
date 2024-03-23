import { IJestLike } from '../../../src/feature-definition-creation';
import { MockDescribeBlock } from './mock-describe-block';
import { MockTest } from './mock-test';

export class MockTestRunner implements IJestLike {
  public rootDescribeBlock: MockDescribeBlock;

  private currentDescribeBlock: MockDescribeBlock;

  constructor() {
    this.rootDescribeBlock = new MockDescribeBlock(null, false, false, false);
    this.currentDescribeBlock = this.rootDescribeBlock;
  }

  public get describe() {
    const createDescribeFunc = (skip: boolean, concurrent: boolean, only: boolean) => {
      return (
        description: number | string | ((...args: unknown[]) => unknown) | jest.FunctionLike,
        func: jest.EmptyFunction,
      ) => {
        const newDescribeBlock = new MockDescribeBlock(description as string, skip, concurrent, only);

        this.currentDescribeBlock.children.push(newDescribeBlock);
        this.currentDescribeBlock = newDescribeBlock;

        func();
      };
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const describeFunc: any = createDescribeFunc(false, false, false);

    describeFunc.only = createDescribeFunc(false, false, true);
    describeFunc.skip = createDescribeFunc(true, false, false);
    describeFunc.concurrent = createDescribeFunc(false, true, false);
    describeFunc.each = () => {
      throw new Error('Not implemented');
    };

    return describeFunc as jest.Describe;
  }

  public get test() {
    const createTestFunc = (skip: boolean, concurrent: boolean, only: boolean) => {
      return (description: string, func: jest.ProvidesCallback) => {
        this.currentDescribeBlock.children.push(new MockTest(description, func, skip, concurrent, only));
      };
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const testFunc: any = createTestFunc(false, false, false);

    testFunc.only = createTestFunc(false, false, true);
    testFunc.skip = createTestFunc(true, false, false);
    testFunc.concurrent = createTestFunc(false, true, false);
    testFunc.each = () => {
      throw new Error('Not implemented');
    };

    return testFunc as jest.It;
  }

  public execute(describeBlock?: MockDescribeBlock) {
    if (!describeBlock) {
      // eslint-disable-next-line no-param-reassign
      describeBlock = this.rootDescribeBlock;
    }

    const testOutputs = describeBlock.children.map(child => {
      if (child instanceof MockTest) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cb: any = () => {
          throw new Error('Callbacks not supported');
        };
        cb.fail = () => {
          throw new Error('Callback failure (callbacks not supported)');
        };

        return child.executionFunc(cb as jest.DoneCallback);
      }
      if (child instanceof MockDescribeBlock) {
        return this.execute(child);
      }
      return null;
    });

    const testPromises: (void | undefined | PromiseLike<unknown> | Promise<Awaited<unknown>[]> | null)[] =
      testOutputs.filter((testOutput: unknown) => {
        if ((testOutput as PromiseLike<unknown>).then !== undefined) {
          return true;
        }
        return false;
      });

    if (!testPromises.length) {
      testPromises.push(Promise.resolve());
    }

    return Promise.all(testPromises);
  }
}
