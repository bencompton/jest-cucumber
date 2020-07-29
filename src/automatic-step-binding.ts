import { ParsedFeature } from './models';
import { matchSteps } from './validation/step-definition-validation';
import { StepsDefinitionCallbackFunction, defineFeature } from './feature-definition-creation';

const globalSteps: Array<{ stepMatcher: string | RegExp, stepFunction: () => any }> = [];

const registerStep = (stepMatcher: string | RegExp, stepFunction: () => any) => {
    globalSteps.push({ stepMatcher, stepFunction });
};

export const autoBindSteps = (features: ParsedFeature[], stepDefinitions: StepsDefinitionCallbackFunction[]) => {
    stepDefinitions.forEach((stepDefinitionCallback) => {
        stepDefinitionCallback({
            defineStep: registerStep,
            given: registerStep,
            when: registerStep,
            then: registerStep,
            and: registerStep,
            but: registerStep,
            pending: () => {
                // Nothing to do
            },
        });
    });

    features.forEach((feature) => {
        defineFeature(feature, (test) => {
            feature.scenarios.forEach((scenario) => {
                test(scenario.title, (options) => {
                    scenario.steps.forEach((step) => {
                        const matches = globalSteps
                            .filter((globalStep) => matchSteps(step.stepText, globalStep.stepMatcher));

                        if (matches.length === 1) {
                            const match = matches[0];

                            options.defineStep(match.stepMatcher, match.stepFunction);
                        } else if (matches.length === 0) {
                            // TODO: Log error
                        } else {
                            // TODO: Log error
                        }
                    });
                });
            });
        });
    });
};
