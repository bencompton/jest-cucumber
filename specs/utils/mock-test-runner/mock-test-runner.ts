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
        const createDescribeFunc = (
            skip: boolean,
            concurrent: boolean,
            only: boolean,
        ) => {
            return (
                description: number
                    | string
                    | ((...args: any[]) => any)
                    | jest.FunctionLike,
                func: jest.EmptyFunction,
            ) => {
                const newDescribeBlock = new MockDescribeBlock(
                    description as string,
                    skip,
                    concurrent,
                    only,
                );

                this.currentDescribeBlock.children.push(newDescribeBlock);
                this.currentDescribeBlock = newDescribeBlock;

                func();
            };
        };

        const describeFunc: any = createDescribeFunc(false, false, false);

        describeFunc.only = createDescribeFunc(false, false, true);
        describeFunc.skip = createDescribeFunc(true, false, false);
        describeFunc.concurrent = createDescribeFunc(false, true, false);
        describeFunc.each = (arr: any[][]) => {
            throw new Error('Not implemented');
        };

        return describeFunc as jest.Describe;
    }

    public get test() {
        const createTestFunc = (
            skip: boolean,
            concurrent: boolean,
            only: boolean,
        ) => {
            return (description: string, func: jest.ProvidesCallback) => {
                this.currentDescribeBlock.children.push(new MockTest(
                    description,
                    func,
                    skip,
                    concurrent,
                    only,
                ));
            };
        };

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
            describeBlock = this.rootDescribeBlock;
        }

        const testOutputs = describeBlock.children.map((child) => {
            if (child instanceof MockTest) {
                const cb: any = () => { throw new Error('Callbacks not supported'); };
                cb.fail = (message: string) => { throw new Error('Callback failure (callbacks not supported)'); };

                return child.executionFunc(cb as jest.DoneCallback);
            } else if (child instanceof MockDescribeBlock) {
                return this.execute(child);
            }
        });

        const testPromises: Array<Promise<any>> = testOutputs.filter((testOutput: any) => {
            if ((testOutput as Promise<any>).then !== undefined) {
                return true;
            } else {
                return false;
            }
        });

        if (!testPromises.length) {
            testPromises.push(Promise.resolve());
        }

        return Promise.all(testPromises);
    }
}
