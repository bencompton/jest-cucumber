import { DefineFeatureFunction } from '../../src/feature-definition-creation';
import { ParsedFeature } from '../../src/models';
import { MockStepDefinitions } from '../utils/wire-up-mock-scenario';

export const featureWithSingleScenario = `
Feature: Test

    @my-tag
    Scenario: Doing some stuff
        Given I did some stuff
        When I do some stuff
        Then I should have done some stuff
`;

export const featureWithMultipleScenarios = `
Feature: Test

    Scenario: Doing some stuff
        Given I did some stuff
        When I do some stuff
        Then I should have done some stuff

    Scenario: Doing some more stuff
        Given I did some stuff
        When I do some stuff
        Then I should have done some stuff

`;

export const featureWithSteplessScenario = `
Feature: Test

    Scenario: Doing nothing at all
`;

export const emptyStepDefinitions: MockStepDefinitions = (
    mockFeature: ParsedFeature,
    defineMockFeature: DefineFeatureFunction,
) => {
    defineMockFeature(mockFeature, () => {
        // No step definitions defined
    });
};

export const stepsForfeatureWithMultipleScenarios: MockStepDefinitions = (
    mockFeature: ParsedFeature,
    defineMockFeature: DefineFeatureFunction,
) => {
    defineMockFeature(mockFeature, (test) => {
        test('Doing some stuff', ({ given, when, then }) => {
            given('I did some stuff', () => {
                // Nothing to do here
            });

            when('I do some stuff', () => {
                // Nothing to do here
            });

            then('I should have done some stuff', () => {
                // Nothing to do here
            });
        });

        test('Doing some more stuff', ({ given, when, then }) => {
            given('I did some stuff', () => {
                // Nothing to do here
            });

            when('I do some stuff', () => {
                // Nothing to do here
            });

            then('I should have done some stuff', () => {
                // Nothing to do here
            });
        });
    });
};

export const stepsWithScenariosOutOfOrder: MockStepDefinitions = (
    mockFeature: ParsedFeature,
    defineMockFeature: DefineFeatureFunction,
) => {
    defineMockFeature(mockFeature, (test) => {
        test('Doing some more stuff', ({ given, when, then }) => {
            given('I did some stuff', () => {
                // Nothing to do here
            });

            when('I do some stuff', () => {
                // Nothing to do here
            });

            then('I should have done some stuff', () => {
                // Nothing to do here
            });
        });

        test('Doing some stuff', ({ given, when, then }) => {
            given('I did some stuff', () => {
                // Nothing to do here
            });

            when('I do some stuff', () => {
                // Nothing to do here
            });

            then('I should have done some stuff', () => {
                // Nothing to do here
            });
        });
    });
};

export const stepsWithStepsOutOfOrder: MockStepDefinitions = (
    mockFeature: ParsedFeature,
    defineMockFeature: DefineFeatureFunction,
) => {
    defineMockFeature(mockFeature, (test) => {
        test('Doing some stuff', ({ given, when, then }) => {
            given('I did some stuff', () => {
                // Nothing to do here
            });

            then('I should have done some stuff', () => {
                // Nothing to do here
            });

            when('I do some stuff', () => {
                // Nothing to do here
            });
        });
    });
};

export const stepsWithMissingStep: MockStepDefinitions = (
    mockFeature: ParsedFeature,
    defineMockFeature: DefineFeatureFunction,
) => {
    defineMockFeature(mockFeature, (test) => {
        test('Doing some stuff', ({ given, when, then }) => {
            given('I did some stuff', () => {
                // Nothing to do here
            });

            when('I do some stuff', () => {
                // Nothing to do here
            });
        });
    });
};

export const stepsWithMismatchedSecondStep: MockStepDefinitions = (
    mockFeature: ParsedFeature,
    defineMockFeature: DefineFeatureFunction,
) => {
    defineMockFeature(mockFeature, (test) => {
        test('Doing some stuff', ({ given, when, then }) => {
            given('I did some stuff', () => {
                // Nothing to do here
            });

            when('I don\'t do some stuff', () => {
                // Nothing to do here
            });

            then('I should have done some stuff', () => {
                // Nothing to do here
            });
        });
    });
};

export const steplessStepDefinitions: MockStepDefinitions = (
    mockFeature: ParsedFeature,
    defineMockFeature: DefineFeatureFunction,
) => {
    defineMockFeature(mockFeature, (test) => {
        test('Doing nothing at all', ({ given, when, then }) => {
            // No steps to define
        });
    });
};
