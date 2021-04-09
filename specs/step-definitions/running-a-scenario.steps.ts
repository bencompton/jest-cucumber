import { loadFeature, defineFeature } from '../../src';
import { MockTestRunner } from '../utils/mock-test-runner/mock-test-runner';
import { wireUpMockFeature } from '../utils/wire-up-mock-scenario';
import { runningAScenarioFeature, runningAScenarioSteps, runningAScenarioStepsWithMissingStep } from '../test-data/running-a-scenario';

const feature = loadFeature('./specs/features/running-a-scenario.feature');

defineFeature(feature, (test) => {
    let mockTestRunner: MockTestRunner;

    beforeEach(() => {
        mockTestRunner = new MockTestRunner();
    });

    test('Running a scenario', ({ given, when, then }) => {
        let testPromise: Promise<any>;

        given('I have a scenario', () => {
            wireUpMockFeature(mockTestRunner, runningAScenarioFeature, runningAScenarioSteps);
        });

        when('I run it', () => {
            testPromise = mockTestRunner.execute();
        });

        then('it should run successfully', async () => {
            await testPromise;
        });
    });

    test('Scenario missing a step', ({ given, when, then }) => {
        let errorMessage: string;

        given('I have a scenario that is missing a step', () => {
            // Nothing to do here
        });

        when('I run it', () => {
            try {
                wireUpMockFeature(mockTestRunner, runningAScenarioFeature, runningAScenarioStepsWithMissingStep);
            } catch (err) {
                errorMessage = err.message;
            }
        });

        then('it should fail with a validation error / missing step code', () => {
            expect(errorMessage).toBeTruthy();
            expect(errorMessage).toMatchSnapshot();
        });
    });
});
