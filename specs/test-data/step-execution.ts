import { DefineFeatureFunction } from '../../src/feature-definition-creation';
import { ParsedFeature } from '../../src/models';
import { MockStepDefinitions } from '../utils/wire-up-mock-scenario';

export const featureToExecute = `
Feature: Executing a feature

    Scenario: Executing a scenario
        Given a given step
        When I run the when step
        Then it should run the then step
`;

export const synchronousSteps = (logs: string[]): MockStepDefinitions => {
    return (
        mockFeature: ParsedFeature,
        defineMockFeature: DefineFeatureFunction,
    ) => {
        defineMockFeature(mockFeature, (test) => {
            test('Executing a scenario', ({ given, when, then }) => {
                given('a given step', () => {
                    logs.push('given step');
                });

                when('i run the when step', () => {
                    logs.push('when step');
                });

                then('it should run the then step', () => {
                    logs.push('then step');
                });
            });
        });
    };
};

export const failingSynchronousStep = (logs: string[]): MockStepDefinitions => {
    return (
        mockFeature: ParsedFeature,
        defineMockFeature: DefineFeatureFunction,
    ) => {
        defineMockFeature(mockFeature, (test) => {
            test('Executing a scenario', ({ given, when, then }) => {
                given('a given step', () => {
                    logs.push('given step');
                });

                when('i run the when step', () => {
                    logs.push('when step');
                    throw new Error('when step failure');
                });

                then('it should run the then step', () => {
                    logs.push('then step');
                });
            });
        });
    };
};

export const asyncStep = (logs: string[]): MockStepDefinitions => {
    return (
        mockFeature: ParsedFeature,
        defineMockFeature: DefineFeatureFunction,
    ) => {
        defineMockFeature(mockFeature, (test) => {
            test('Executing a scenario', ({ given, when, then }) => {
                given('a given step', () => {
                    logs.push('given step');
                });

                when('i run the when step', async () => {
                    logs.push('when step started');

                    await new Promise<void>((resolve) => {
                        setTimeout(() => {
                            logs.push('when step completed');
                            resolve();
                        }, 5);
                    });
                });

                then('it should run the then step', () => {
                    logs.push('then step');
                });
            });
        });
    };
};

export const failingAsyncStep = (logs: string[]): MockStepDefinitions => {
    return (
        mockFeature: ParsedFeature,
        defineMockFeature: DefineFeatureFunction,
    ) => {
        defineMockFeature(mockFeature, (test) => {
            test('Executing a scenario', ({ given, when, then }) => {
                given('a given step', () => {
                    logs.push('given step');
                });

                when('i run the when step', async () => {
                    logs.push('when step started');

                    await new Promise<void>((resolve, reject) => {
                        setTimeout(() => {
                            reject(new Error('when step failure'));
                        }, 5);
                    });
                });

                then('it should run the then step', () => {
                    logs.push('then step');
                });
            });
        });
    };
};
