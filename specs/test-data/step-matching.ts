import { DefineFeatureFunction } from '../../src/feature-definition-creation';
import { ParsedFeature } from '../../src/models';
import { MockStepDefinitions } from '../utils/wire-up-mock-scenario';

export const featureWithStepsToMatch = `
Feature: Matching steps

    Scenario: Matching steps
        Given a given step with step arguments "1" and "2"
`;

export const stringStepMatcher = (stepArgs: unknown[]): MockStepDefinitions => {
  return (mockFeature: ParsedFeature, defineMockFeature: DefineFeatureFunction) => {
    defineMockFeature(mockFeature, test => {
      test('Matching steps', ({ given }) => {
        given('a given step with step arguments "1" and "2"', (...args: unknown[]) => {
          args.forEach(arg => stepArgs.push(arg));
        });
      });
    });
  };
};

export const regexStepMatcher = (stepArgs: unknown[]): MockStepDefinitions => {
  return (mockFeature: ParsedFeature, defineMockFeature: DefineFeatureFunction) => {
    defineMockFeature(mockFeature, test => {
      test('Matching steps', ({ given }) => {
        given(/a given step with step arguments "(\d+)" and "(\d+)"/, (...args: unknown[]) => {
          args.forEach(arg => stepArgs.push(arg));
        });
      });
    });
  };
};
