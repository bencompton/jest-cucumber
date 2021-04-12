import { loadFeature, defineFeature, DefineStepFunction } from '../../src';
import { asyncStep, failingAsyncStep, failingSynchronousStep, featureToExecute, synchronousSteps } from '../test-data/step-execution';
import { MockTestRunner } from '../utils/mock-test-runner/mock-test-runner';
import { MockStepDefinitions, wireUpMockFeature } from '../utils/wire-up-mock-scenario';

const feature = loadFeature('./specs/features/steps/step-execution.feature');

defineFeature(feature, (test) => {
    let mockTestRunner: MockTestRunner;
    let errorMessage = '';
    let stepDefinitions: MockStepDefinitions | null = null;
    let featureFile: string | null = null;
    let logs: string[];

    beforeEach(() => {
        mockTestRunner = new MockTestRunner();
        errorMessage = '';
        logs = [];
    });

    const whenIExecuteThatScenarioInJestCucumber = (when: DefineStepFunction) => {
        when('I execute that scenario in Jest Cucumber', async () => {
            try {
                wireUpMockFeature(mockTestRunner,
                    featureFile as string,
                    stepDefinitions,
                );

                await mockTestRunner.execute();
            } catch (err) {
                errorMessage = err.message;
            }
        });
    };

    const andIShouldSeeWhichStepFailed = (and: DefineStepFunction) => {
        and('I should see which step failed', () => {
            expect(errorMessage.toLowerCase()).toContain('i run the when step');
        });
    };

    const thenIShouldSeeTheErrorThatOccurred = (then: DefineStepFunction) => {
        then('I should see the error that occurred', () => {
            expect(errorMessage).toBeTruthy();
            expect(errorMessage).toContain('when step failure');
        });
    };

    test('Scenario with multiple step definitions', ({ given, when, then }) => {
        given('a scenario with multiple step definitions', () => {
            featureFile = featureToExecute;
            stepDefinitions = synchronousSteps(logs);
        });

        whenIExecuteThatScenarioInJestCucumber(when);

        then('all steps should be executed in order', () => {
            expect(errorMessage).toBeFalsy();
            expect(logs.length).toBe(3);
            expect(logs[0]).toBe('given step');
            expect(logs[1]).toBe('when step');
            expect(logs[2]).toBe('then step');
        });
    });

    test('Scenario with a failing synchronous step', ({ given, when, then, and }) => {
        given('a scenario with a failing synchronous step', () => {
            featureFile = featureToExecute;
            stepDefinitions = failingSynchronousStep(logs);
        });

        whenIExecuteThatScenarioInJestCucumber(when);
        thenIShouldSeeTheErrorThatOccurred(then);
        andIShouldSeeWhichStepFailed(and);

        and('no more steps should execute', () => {
            expect(logs.length).toBe(2);
            expect(logs[0]).toBe('given step');
            expect(logs[1]).toBe('when step');
        });
    });

    test('Scenario with an async step', ({ given, when, then }) => {
        given('a scenario with an async step', () => {
            featureFile = featureToExecute;
            stepDefinitions = asyncStep(logs);
        });

        whenIExecuteThatScenarioInJestCucumber(when);

        then('the next step should not execute until the promise resolves', () => {
            expect(logs.length).toBe(4);
            expect(logs[0]).toBe('given step');
            expect(logs[1]).toBe('when step started');
            expect(logs[2]).toBe('when step completed');
            expect(logs[3]).toBe('then step');
        });
    });

    test('Scenario with a failing async step', ({ given, when, then, and }) => {
        given('a scenario with a failing async step', () => {
            featureFile = featureToExecute;
            stepDefinitions = failingAsyncStep(logs);
        });

        whenIExecuteThatScenarioInJestCucumber(when);
        thenIShouldSeeTheErrorThatOccurred(then);
        andIShouldSeeWhichStepFailed(and);

        and('no more steps should execute', () => {
            expect(logs.length).toBe(2);
            expect(logs[0]).toBe('given step');
            expect(logs[1]).toBe('when step started');
        });
    });
});
