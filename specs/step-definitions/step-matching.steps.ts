import { loadFeature, defineFeature, DefineStepFunction } from '../../src';
import { featureWithStepsToMatch, regexStepMatcher, stringStepMatcher } from '../test-data/step-matching';
import { MockTestRunner } from '../utils/mock-test-runner/mock-test-runner';
import { MockStepDefinitions, wireUpMockFeature } from '../utils/wire-up-mock-scenario';

const feature = loadFeature('./specs/features/steps/step-matching.feature');

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

    const thenTheStepShouldMatchCorrectly = (then: DefineStepFunction) => {
        then('the step should match correctly', () => {
            expect(errorMessage).toBeFalsy();
        });
    };

    test('Step definition with plain string', ({ given, when, then, and }) => {
        given('a step matched with a plain string in a step definition', () => {
            featureFile = featureWithStepsToMatch;
            stepDefinitions = stringStepMatcher(stepArguments);
        });

        whenIRunMyJestCucumberTests(when);
        thenTheStepShouldMatchCorrectly(then);

        and('no step arguments should be passed to the step definition', () => {
            expect(stepArguments.length).toBe(0);
        });
    });

    test('Regex step definition with 2 capture groups', ({ given, when, then, and }) => {
        given('a step matched with a regex that has 2 capture groups', () => {
            featureFile = featureWithStepsToMatch;
            stepDefinitions = regexStepMatcher(stepArguments);
        });

        whenIRunMyJestCucumberTests(when);
        thenTheStepShouldMatchCorrectly(then);

        and('2 step arguments should be passed to the step definition', () => {
            expect(stepArguments.length).toBe(2);
            expect(stepArguments[0]).toBe('1');
            expect(stepArguments[1]).toBe('2');
        });
    });
});
