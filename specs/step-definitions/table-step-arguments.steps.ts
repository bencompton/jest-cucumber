import { loadFeature, defineFeature, DefineStepFunction } from '../../src';
import { featureWithTableArgument, tableStepWithoutStepArgs, tableStepWithStepArgs } from '../test-data/step-table-arguments';
import { MockTestRunner } from '../utils/mock-test-runner/mock-test-runner';
import { MockStepDefinitions, wireUpMockFeature } from '../utils/wire-up-mock-scenario';

const feature = loadFeature('./specs/features/steps/table-step-arguments.feature');

defineFeature(feature, (test) => {
    let mockTestRunner: MockTestRunner;
    let errorMessage = '';
    let stepDefinitions: MockStepDefinitions | null = null;
    let featureFile: string | null = null;
    let stepArguments: any[];

    beforeEach(() => {
        mockTestRunner = new MockTestRunner();
        errorMessage = '';
        stepArguments = [];
    });

    const whenIRunMyJestCucumberTests = (when: DefineStepFunction) => {
        when('I run my Jest Cucumber tests', async () => {
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

    const checkTable = (table: any) => {
        expect(table.length).toBe(2);
        expect(table[0]).toEqual({ foo: 'baz', bar: 'boo' });
        expect(table[1]).toEqual({ foo: 'ban', bar: 'bat' });
    };

    test('Step definition with a table argument', ({ given, when, then }) => {
        given('a step with a table argument', () => {
            featureFile = featureWithTableArgument;
            stepDefinitions = tableStepWithoutStepArgs(stepArguments);
        });

        whenIRunMyJestCucumberTests(when);

        then('my step definitions should get an argument with array of table row objects', () => {
            expect(errorMessage).toBeFalsy();
            expect(stepArguments.length).toBe(1);
            const table = stepArguments[0];
            checkTable(table);
        });
    });

    test('Step definition with regex capture groups and a table argument', ({ given, when, then, and }) => {
        given('a step with a table argument \/ 2 regex capture groups', () => {
            featureFile = featureWithTableArgument;
            stepDefinitions = tableStepWithStepArgs(stepArguments);
        });

        whenIRunMyJestCucumberTests(when);

        then('the first 2 arguments should be the regex capture groups', () => {
            expect(errorMessage).toBeFalsy();
            expect(stepArguments.length).toBe(3);
            expect(stepArguments[0]).toBe('1');
            expect(stepArguments[1]).toBe('2');
        });

        and('the third argument should be the array of table row objects', () => {
            const table = stepArguments[2];
            checkTable(table);
        });
    });
});
