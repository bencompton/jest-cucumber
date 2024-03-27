import { ParsedFeature } from './models';
import { matchSteps } from './validation/step-definition-validation';
import {
  createDefineFeature,
  IJestLike,
  type StepsDefinitionCallbackFunctionWithContext,
} from './feature-definition-creation';
import { generateStepCode } from './code-generation/step-generation';

const globalSteps: Array<{ stepMatcher: string | RegExp; stepFunction: () => unknown }> = [];

const registerStep = (stepMatcher: string | RegExp, stepFunction: () => unknown) => {
  globalSteps.push({ stepMatcher, stepFunction });
};

export const createAutoBindSteps = (jestLike: IJestLike) => {
  const defineFeature = createDefineFeature(jestLike);

  return <C extends NonNullable<unknown> = NonNullable<unknown>>(
    parsedFeatures: ParsedFeature | ParsedFeature[],
    stepDefinitions: StepsDefinitionCallbackFunctionWithContext<C>[],
  ) => {
    let features = parsedFeatures;
    if (!Array.isArray(features)) {
      features = [features];
    }

    const context = {} as C;

    stepDefinitions.forEach(stepDefinitionCallback => {
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
        context,
      });
    });

    const errors: string[] = [];

    features.forEach(feature => {
      defineFeature(feature, test => {
        const scenarioOutlineScenarios = feature.scenarioOutlines.map(scenarioOutline => ({
          ...scenarioOutline.scenarios[0],
          // we need to use the original title with un-expanded placeholders,
          // otherwise it will try to match the expanded version in the feature file and fail.
          title: scenarioOutline.title,
        }));

        const scenarios = [...feature.scenarios, ...scenarioOutlineScenarios];

        scenarios.forEach(scenario => {
          test(scenario.title, options => {
            scenario.steps.forEach((step, stepIndex) => {
              const matches = globalSteps.filter(globalStep => matchSteps(step.stepText, globalStep.stepMatcher));

              if (matches.length === 1) {
                const match = matches[0];

                options.defineStep(match.stepMatcher, match.stepFunction);
              } else if (matches.length === 0) {
                const stepCode = generateStepCode(scenario.steps, stepIndex, false);
                errors.push(
                  `No matching step found for step "${step.stepText}" in scenario "${scenario.title}" in feature "${feature.title}". Please add the following step code: \n\n${stepCode}`,
                );
              } else {
                const matchingCode = matches.map(
                  match => `${match.stepMatcher.toString()}\n\n${match.stepFunction.toString()}`,
                );
                errors.push(
                  `${matches.length} step definition matches were found for step "${step.stepText}" in scenario "${scenario.title}" in feature "${feature.title}". Each step can only have one matching step definition. The following step definition matches were found:\n\n${matchingCode.join('\n\n')}`,
                );
              }
            });
          });
        });
      });
    });

    if (errors.length) {
      throw new Error(errors.join('\n\n'));
    }
  };
};
