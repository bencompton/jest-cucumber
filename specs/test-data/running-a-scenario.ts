import { MockStepDefinitions } from '../utils/wire-up-mock-scenario';

export const runningAScenarioFeature = `
Feature: Test

Scenario: Doing some stuff
    Given I did some stuff
    When I do some stuff
    Then I should have done some stuff
`;

export const runningAScenarioSteps: MockStepDefinitions = (mockFeature, defineMockFeature) => {
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
    });
};

export const runningAScenarioStepsWithMissingStep: MockStepDefinitions = (mockFeature, defineMockFeature) => {
    defineMockFeature(mockFeature, (test) => {
        test('Doing some stuff', ({ given, when, then }) => {
            given('I did some stuff', () => {});
            when('I do some stuff', () => {});
        });
    });
};
