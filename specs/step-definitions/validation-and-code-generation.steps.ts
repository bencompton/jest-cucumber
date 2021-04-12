import { loadFeature, defineFeature, DefineStepFunction } from '../../src';
import { MockTestRunner } from '../utils/mock-test-runner/mock-test-runner';
import { MockStepDefinitions, wireUpMockFeature } from '../utils/wire-up-mock-scenario';
import {
    emptyStepDefinitions,
    featureWithMultipleScenarios,
    featureWithSingleScenario,
    featureWithSteplessScenario,
    steplessStepDefinitions,
    stepsForfeatureWithMultipleScenarios,
    stepsWithMismatchedSecondStep,
    stepsWithMissingStep,
    stepsWithScenariosOutOfOrder,
    stepsWithStepsOutOfOrder,
} from '../test-data/validation-and-code-generation';
import { defaultConfiguration, defaultErrorSettings, ErrorOptions, Options } from '../../src/configuration';

const feature = loadFeature('./specs/features/validation-and-code-generation.feature');

defineFeature(feature, (test) => {
    let mockTestRunner: MockTestRunner;
    let errorMessage = '';
    let options: Options;
    let stepDefinitions: MockStepDefinitions | null = null;
    let featureFile: string | null = null;

    beforeEach(() => {
        mockTestRunner = new MockTestRunner();
        errorMessage = '';
        options = { ...defaultConfiguration };
        options.errors = { ...defaultErrorSettings };
    });

    const givenScenariosMustMatchFeatureFileIsEnabled = (given: DefineStepFunction) => {
        given(/`scenariosMustMatchFeatureFile` is (enabled|disabled)/, (enabledOrDisabled) => {
            (options.errors as ErrorOptions).scenariosMustMatchFeatureFile =
                enabledOrDisabled === 'enabled';
        });
    };

    const givenScenariosMustMatchFeatureFileIsDisabled = givenScenariosMustMatchFeatureFileIsEnabled;

    const givenStepsMustMatchFeatureFileIsEnabled = (given: DefineStepFunction) => {
        given(/`stepsMustMatchFeatureFile` is (enabled|disabled)/, (enabledOrDisabled) => {
            (options.errors as ErrorOptions).stepsMustMatchFeatureFile =
                enabledOrDisabled === 'enabled';
        });
    };

    const givenAllowScenariosNotInFeatureFileIsEnabled = (given: DefineStepFunction) => {
        given(/`allowScenariosNotInFeatureFile` is (enabled|disabled)/, (enabledOrDisabled) => {
            (options.errors as ErrorOptions).allowScenariosNotInFeatureFile =
                enabledOrDisabled === 'enabled';
        });
    };

    const givenAllowScenariosNotInFeatureFileIsDisabled = givenAllowScenariosNotInFeatureFileIsEnabled;

    const givenStepsMustMatchFeatureFileIsDisabled = givenStepsMustMatchFeatureFileIsEnabled;

    const whenIRunMyJestCucumberTests = (when: DefineStepFunction) => {
        when('I run my Jest Cucumber tests', () => {
            try {
                wireUpMockFeature(mockTestRunner,
                    featureFile as string,
                    stepDefinitions,
                    options,
                );
            } catch (err) {
                errorMessage = err.message;
            }
        });
    };

    const thenIShouldSeeAValidationErrorAndGeneratedCode = (then: DefineStepFunction) => {
        then(/I should (see|not see) a validation error \/ generated code/, (seeOrNotSee) => {
            if (seeOrNotSee === 'see') {
                expect(errorMessage).toBeTruthy();
                expect(errorMessage).toMatchSnapshot();
            } else {
                expect(errorMessage).toBeFalsy();
            }
        });
    };

    const thenIShouldNotSeeAValidationErrorAndGeneratedCode = thenIShouldSeeAValidationErrorAndGeneratedCode;

    const thenIShouldSeeAValidationError = (then: DefineStepFunction) => {
        then(/I should (see|not see) a validation error/, (seeOrNotSee) => {
            if (seeOrNotSee === 'see') {
                expect(errorMessage).toBeTruthy();
                expect(errorMessage).toMatchSnapshot();
            } else {
                expect(errorMessage).toBeFalsy();
            }
        });
    };

    const thenIShouldNotSeeAValidationError = thenIShouldSeeAValidationError;

    const andAScenarioInAFeatureFileHasNoStepDefinitions = (and: DefineStepFunction) => {
        and('a scenario in a feature file has no step definitions', () => {
            featureFile = featureWithSingleScenario;
            stepDefinitions = emptyStepDefinitions;
        });
    };

    const andTheStepOrderDiffersBetweenTheFeatureAndStepDefinitions = (and: DefineStepFunction) => {
        and('the step order differs between the feature / step definitions', () => {
            featureFile = featureWithSingleScenario;
            stepDefinitions = stepsWithStepsOutOfOrder;
        });
    };

    const andTheStepCountDiffersBetweenTheFeatureAndStepDefinitions = (and: DefineStepFunction) => {
        and('the step count differs between the feature / step definitions', () => {
            featureFile = featureWithSingleScenario;
            stepDefinitions = stepsWithMissingStep;
        });
    };

    const andIHaveAScenarioWhereTheStepMatcherForTheSecondStepDoesntMatchTheStep = (and: DefineStepFunction) => {
        and('I have a scenario where the step matcher for the second step doesn\'t match the step', () => {
            featureFile = featureWithSingleScenario;
            stepDefinitions = stepsWithMismatchedSecondStep;
        });
    };

    const andThereIsAnExtraScenarioInMyStepDefinitionsNotInMyFeatureFile = (and: DefineStepFunction) => {
        and('there is an extra scenario in my step definitions not in my feature file', () => {
            featureFile = featureWithSingleScenario;
            stepDefinitions = stepsForfeatureWithMultipleScenarios;
        });
    };

    test('Enabled and scenario missing step definitions', ({ given, and, when, then }) => {
        givenScenariosMustMatchFeatureFileIsEnabled(given);
        andAScenarioInAFeatureFileHasNoStepDefinitions(and);
        whenIRunMyJestCucumberTests(when);
        thenIShouldSeeAValidationErrorAndGeneratedCode(then);
    });

    test('Disabled and scenario missing step definitions', ({ given, and, when, then }) => {
        givenScenariosMustMatchFeatureFileIsDisabled(given);
        andAScenarioInAFeatureFileHasNoStepDefinitions(and);
        whenIRunMyJestCucumberTests(when);
        thenIShouldNotSeeAValidationErrorAndGeneratedCode(then);
    });

    test('Enabled and scenario filtered via tag filter', ({ given, and, when, then }) => {
        givenScenariosMustMatchFeatureFileIsEnabled(given);
        andAScenarioInAFeatureFileHasNoStepDefinitions(and);

        and('that scenario is filtered via a tag filter', () => {
            options.tagFilter = 'not @my-tag';
        });

        whenIRunMyJestCucumberTests(when);
        thenIShouldNotSeeAValidationErrorAndGeneratedCode(then);
    });

    test('Scenario order is the same', ({ given, and, when, then }) => {
        givenScenariosMustMatchFeatureFileIsEnabled(given);

        and('a set of scenarios is ordered the same in the feature / step definitions', () => {
            featureFile = featureWithMultipleScenarios;
            stepDefinitions = stepsForfeatureWithMultipleScenarios;
        });

        whenIRunMyJestCucumberTests(when);
        thenIShouldNotSeeAValidationErrorAndGeneratedCode(then);
    });

    test('Scenario order is different', ({ given, and, when, then }) => {
        givenScenariosMustMatchFeatureFileIsEnabled(given);

        and('a set of scenarios is ordered the differently in the feature / step definitions', () => {
            featureFile = featureWithMultipleScenarios;
            stepDefinitions = stepsWithScenariosOutOfOrder;
        });

        whenIRunMyJestCucumberTests(when);
        thenIShouldNotSeeAValidationErrorAndGeneratedCode(then);
    });

    test('Enabled and step order / count are the same', ({ given, and, when, then }) => {
        givenStepsMustMatchFeatureFileIsEnabled(given);

        and('the step definitions exactly match the feature file', () => {
            featureFile = featureWithMultipleScenarios;
            stepDefinitions = stepsForfeatureWithMultipleScenarios;
        });

        whenIRunMyJestCucumberTests(when);
        thenIShouldNotSeeAValidationErrorAndGeneratedCode(then);
    });

    test('Enabled and step order is different', ({ given, and, when, then }) => {
        givenStepsMustMatchFeatureFileIsEnabled(given);
        andTheStepOrderDiffersBetweenTheFeatureAndStepDefinitions(and);
        whenIRunMyJestCucumberTests(when);
        thenIShouldSeeAValidationErrorAndGeneratedCode(then);
    });

    test('Enabled and step count is different', ({ given, and, when, then }) => {
        givenStepsMustMatchFeatureFileIsEnabled(given);
        andTheStepCountDiffersBetweenTheFeatureAndStepDefinitions(and);
        whenIRunMyJestCucumberTests(when);
        thenIShouldSeeAValidationErrorAndGeneratedCode(then);
    });

    test('Disabled and step order is different', ({ given, and, when, then }) => {
        givenStepsMustMatchFeatureFileIsDisabled(given);
        andTheStepOrderDiffersBetweenTheFeatureAndStepDefinitions(and);
        whenIRunMyJestCucumberTests(when);
        thenIShouldNotSeeAValidationErrorAndGeneratedCode(then);
    });

    test('Disabled and step count is different', ({ given, and, when, then }) => {
        givenStepsMustMatchFeatureFileIsDisabled(given);
        andTheStepCountDiffersBetweenTheFeatureAndStepDefinitions(and);
        whenIRunMyJestCucumberTests(when);
        thenIShouldNotSeeAValidationErrorAndGeneratedCode(then);
    });

    // tslint:disable-next-line: max-line-length
    test('Enabled and a step in the step definitions doesn\'t match the step in the feature', ({ given, and, when, then }) => {
        givenStepsMustMatchFeatureFileIsEnabled(given);
        andIHaveAScenarioWhereTheStepMatcherForTheSecondStepDoesntMatchTheStep(and);
        whenIRunMyJestCucumberTests(when);
        thenIShouldSeeAValidationErrorAndGeneratedCode(then);
    });

    // tslint:disable-next-line: max-line-length
    test('Disabled and a step in the step definitions doesn\'t match the step in the feature', ({ given, and, when, then }) => {
        givenStepsMustMatchFeatureFileIsDisabled(given);
        andIHaveAScenarioWhereTheStepMatcherForTheSecondStepDoesntMatchTheStep(and);
        whenIRunMyJestCucumberTests(when);
        thenIShouldNotSeeAValidationErrorAndGeneratedCode(then);
    });

    test('Scenario with no steps', ({ given, and, when, then }) => {
        givenStepsMustMatchFeatureFileIsDisabled(given);

        and('I have a scenario with no steps', () => {
            featureFile = featureWithSteplessScenario;
            stepDefinitions = steplessStepDefinitions;
        });

        whenIRunMyJestCucumberTests(when);
        thenIShouldNotSeeAValidationErrorAndGeneratedCode(then);
    });

    test('Enabled and step definitions have an extra scenario', ({ given, and, when, then }) => {
        givenAllowScenariosNotInFeatureFileIsEnabled(given);
        andThereIsAnExtraScenarioInMyStepDefinitionsNotInMyFeatureFile(and);
        whenIRunMyJestCucumberTests(when);
        thenIShouldNotSeeAValidationError(then);
    });

    test('Disabled and step definitions have an extra scenario', ({ given, and, when, then }) => {
        givenAllowScenariosNotInFeatureFileIsDisabled(given);
        andThereIsAnExtraScenarioInMyStepDefinitionsNotInMyFeatureFile(and);
        whenIRunMyJestCucumberTests(when);
        thenIShouldSeeAValidationError(then);
    });
});
