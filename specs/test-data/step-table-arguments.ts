import { DefineFeatureFunction } from '../../src/feature-definition-creation';
import { ParsedFeature } from '../../src/models';
import { MockStepDefinitions } from '../utils/wire-up-mock-scenario';

export const featureWithTableArgument = `
Feature: Table arguments

    Scenario: Matching steps
        Given a given step with step arguments "1" and "2" and this:
        | foo | bar |
        | baz | boo |
        | ban | bat |
`;

export const tableStepWithoutStepArgs = (stepArgs: any[]): MockStepDefinitions => {
    return (
        mockFeature: ParsedFeature,
        defineMockFeature: DefineFeatureFunction,
    ) => {
        defineMockFeature(mockFeature, (test) => {
            test('Matching steps', ({ given }) => {
                given('a given step with step arguments "1" and "2" and this:', (...args: any[]) => {
                    args.forEach((arg) => stepArgs.push(arg));
                });
            });
        });
    };
};

export const tableStepWithStepArgs = (stepArgs: any[]): MockStepDefinitions => {
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
