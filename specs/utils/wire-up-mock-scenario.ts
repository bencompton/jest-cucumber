import { parseFeature } from '../../src';
import { createDefineFeature, DefineFeatureFunction } from '../../src/feature-definition-creation';
import { ParsedFeature } from '../../src/models';
import { MockTestRunner } from './mock-test-runner/mock-test-runner';

export type MockStepDefinitions = (feature: ParsedFeature, defineFeature: DefineFeatureFunction) => void;

export const wireUpMockFeature = (
    mockTestRunner: MockTestRunner,
    featureFile: string,
    mockStepDefinitions: MockStepDefinitions,
) => {
    const defineMockFeature = createDefineFeature(mockTestRunner);
    const mockFeature = parseFeature(featureFile);
    mockStepDefinitions(mockFeature, defineMockFeature);
};
