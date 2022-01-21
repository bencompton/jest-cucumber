import { DefineFeatureFunction } from '../../src/feature-definition-creation';
import { ParsedFeature } from '../../src/models';
import { MockStepDefinitions } from '../utils/wire-up-mock-scenario';

export const featureWithStepsToMatch = `
Feature: Matching steps

    Scenario: Matching steps
        Given a given step with step arguments "1" and "2"
`;

export const stringStepMatcher = (stepArgs: any[]): MockStepDefinitions => {
    return (
        mockFeature: ParsedFeature,
        defineMockFeature: DefineFeatureFunction,
    ) => {
        defineMockFeature(mockFeature, (test) => {
            test('Matching steps', ({ given }) => {
                given('a given step with step arguments "1" and "2"', (...args: any[]) => {
                    args.forEach((arg) => stepArgs.push(arg));
                });
            });
        });
    };
};

export const regexStepMatcher = (stepArgs: any[]): MockStepDefinitions => {
    return (
        mockFeature: ParsedFeature,
        defineMockFeature: DefineFeatureFunction,
    ) => {
        defineMockFeature(mockFeature, (test) => {
            test('Matching steps', ({ given }) => {
                given(/a given step with step arguments "(\d+)" and "(\d+)"/, (...args: any[]) => {
                    args.forEach((arg) => stepArgs.push(arg));
                });
            });
        });
    };
};
