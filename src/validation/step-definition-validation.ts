import { Scenario, ScenarioOutline, Options } from '../models';
import { generateStepCode } from '../code-generation/step-generation';

export const matchSteps = (stepFromFeatureFile: string, stepMatcher: string | RegExp) => {
    if (typeof stepMatcher === 'string') {
        return stepFromFeatureFile.toLocaleLowerCase() === stepMatcher.toLocaleLowerCase();
    } else if (stepMatcher instanceof RegExp) {
        return stepFromFeatureFile.match(stepMatcher);
    } else {
        return false;
    }
};

export const ensureThereAreNoMissingSteps = (
    options: Options,
    parsedScenario: Scenario | ScenarioOutline,
) => {
    if (options && options.errors === false) {
        return;
    }

    if (!parsedScenario) {
        return;
    }

    const errors: string[] = [];

    parsedScenario.steps.map( (step, index) => {
      if (step.stepMatcher === undefined) {
            errors.push(`No step definition found for step #${index + 1} in scenario "${parsedScenario.title}". Try adding the following code:\n\n${generateStepCode(step)}`);
      }
    });

    if (errors.length) {
        throw new Error(errors.join('\n\n'));
    }
};
