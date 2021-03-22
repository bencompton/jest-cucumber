import { Feature, Rule } from './models';
import { matchSteps } from './validation/step-definition-validation';
import {
    StepsDefinitionCallbackFunction,
    defineFeature,
    DefineScenarioFunctionWithAliases,
} from './feature-definition-creation';
import { generateStepCode } from './code-generation/step-generation';

const globalSteps: Array<{ stepMatcher: string | RegExp, stepFunction: () => any }> = [];

const registerStep = (stepMatcher: string | RegExp, stepFunction: () => any) => {
    globalSteps.push({ stepMatcher, stepFunction });
};

const registerSteps = (stepDefinitionCallback: StepsDefinitionCallbackFunction) => {
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
};

const matchAndDefineSteps = (group: Rule | Feature, test: DefineScenarioFunctionWithAliases, errors: string[]) => {
    const scenarioOutlineScenarios = group.scenarioOutlines.map((scenarioOutline) => scenarioOutline.scenarios[0]);

    const scenarios = [ ...group.scenarios, ...scenarioOutlineScenarios ];

    scenarios.forEach((scenario) => {
        test(scenario.title, (options) => {
            scenario.steps.forEach((step, stepIndex) => {
                const matches = globalSteps.filter((globalStep) => matchSteps(step.stepText, globalStep.stepMatcher));

                if (matches.length === 1) {
                    const match = matches[0];

                    options.defineStep(match.stepMatcher, match.stepFunction);
                } else if (matches.length === 0) {
                    const stepCode = generateStepCode(scenario.steps[stepIndex], false);
                    // tslint:disable-next-line:max-line-length
                    errors.push(
                        `No matching step found for step "${step.stepText}" in scenario "${scenario.title}" in feature "${group.title}". Please add the following step code: \n\n${stepCode}`,
                    );
                } else {
                    const matchingCode = matches.map(
                        (match) => `${match.stepMatcher.toString()}\n\n${match.stepFunction.toString()}`,
                    );
                    errors.push(
                        `${matches.length} step definition matches were found for step "${step.stepText}" in scenario "${scenario.title}" in feature "${group.title}". Each step can only have one matching step definition. The following step definition matches were found:\n\n${matchingCode.join(
                            '\n\n',
                        )}`,
                    );
                }
            });
        });
    });
};

export const autoBindSteps = (features: Feature[], stepDefinitions: StepsDefinitionCallbackFunction[]) => {
    stepDefinitions.forEach(registerSteps);

    const errors: string[] = [];

    features.forEach((feature) => {
        defineFeature(feature, ({test, rule}) => {
            matchAndDefineSteps(feature, test, errors);
            feature.rules.forEach((parsedRule) => {
              rule(parsedRule.title, (ruleTest) => {
                matchAndDefineSteps(parsedRule, ruleTest, errors);
              });
            });
        });
    });

    if (errors.length) {
        throw new Error(errors.join('\n\n'));
    }
};
