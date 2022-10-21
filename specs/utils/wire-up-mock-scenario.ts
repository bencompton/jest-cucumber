import { GherkinClassicTokenMatcher } from '@cucumber/gherkin';
import { parseFeature } from '../../src';
import { Options } from '../../src/configuration';
import { createDefineFeature, DefineFeatureFunction } from '../../src/feature-definition-creation';
import { ParsedFeature } from '../../src/models';
import { MockTestRunner } from './mock-test-runner/mock-test-runner';

export type MockStepDefinitions = (feature: ParsedFeature, defineFeature: DefineFeatureFunction) => void;

export const wireUpMockFeature = (
    mockTestRunner: MockTestRunner,
    featureFile: string,
    mockStepDefinitions: MockStepDefinitions | null,
    options?: Options,
) => {
    const defineMockFeature = createDefineFeature(mockTestRunner);
    const mockFeature = parseFeature(featureFile, new GherkinClassicTokenMatcher(), options);

    if (mockStepDefinitions) {
        mockStepDefinitions(mockFeature, defineMockFeature);
    }
};
