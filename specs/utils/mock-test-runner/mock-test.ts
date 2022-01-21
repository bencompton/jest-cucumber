export class MockTest {
    public description: string;
    public executionFunc: jest.ProvidesCallback;
    public skip: boolean = false;
    public concurrent: boolean = false;
    public only: boolean = false;

    constructor(
        description: string,
        executionFunc: jest.ProvidesCallback,
        skip: boolean,
        concurrent: boolean,
        only: boolean,
    ) {
        this.description = description;
        this.executionFunc = executionFunc;
        this.skip = skip;
        this.concurrent = concurrent;
        this.only = only;
    }
}
