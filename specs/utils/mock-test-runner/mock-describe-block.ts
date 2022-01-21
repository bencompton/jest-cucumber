import { MockTest } from './mock-test';

export class MockDescribeBlock {
    public description: string | null = null;
    public skip: boolean = false;
    public concurrent: boolean = false;
    public only: boolean = false;
    public children: Array<MockTest | MockDescribeBlock> = [];

    constructor(
        description: string | null,
        skip: boolean,
        concurrent: boolean,
        only: boolean,
    ) {
        this.description = description;
        this.skip = skip;
        this.concurrent = concurrent;
        this.only = only;
    }
}
