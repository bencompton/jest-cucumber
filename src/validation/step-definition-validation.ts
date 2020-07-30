import { ParsedScenario, ParsedScenarioOutline, ScenarioFromStepDefinitions, Options, ParsedStep } from '../models';
import { generateScenarioCode } from '../code-generation/scenario-generation';
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

export const ensureFeatureFileAndStepDefinitionScenarioHaveSameSteps = (
    options: Options,
    parsedScenario: ParsedScenario | ParsedScenarioOutline,
    scenarioFromStepDefinitions: ScenarioFromStepDefinitions,
) => {
    if (options && options.errors === false) {
        return;
    }

    if (!parsedScenario) {
        return;
    }

    const errors: string[] = [];

    let parsedScenarioSteps: ParsedStep[] = [];

    if ((parsedScenario as ParsedScenarioOutline).scenarios) {
        const parsedScenarioOutlineScenarios = (parsedScenario as ParsedScenarioOutline).scenarios;

        if (parsedScenarioOutlineScenarios && parsedScenarioOutlineScenarios.length) {
            parsedScenarioSteps = parsedScenarioOutlineScenarios[0].steps;
        } else {
            parsedScenarioSteps = [];
        }
    } else if ((parsedScenario as ParsedScenario).steps) {
        parsedScenarioSteps = (parsedScenario as ParsedScenario).steps;
    }

    const parsedStepCount = parsedScenarioSteps.length;
    const stepDefinitionCount = scenarioFromStepDefinitions.steps.length;

    if (parsedStepCount !== stepDefinitionCount && options.errors) {
        // tslint:disable-next-line:max-line-length
        errors.push(`Scenario "${parsedScenario.title}" has ${parsedStepCount} step(s) in the feature file, but ${stepDefinitionCount} step definition(s) defined. Try adding the following code:\n\n${generateScenarioCode(parsedScenario)}`);
    }

    parsedScenarioSteps.forEach((parsedStep, index) => {
        const stepFromStepDefinitions = scenarioFromStepDefinitions.steps[index];

        if (!stepFromStepDefinitions || !matchSteps(parsedStep.stepText, stepFromStepDefinitions.stepMatcher)) {
            // tslint:disable-next-line:max-line-length
            errors.push(`Expected step #${index + 1} in scenario "${parsedScenario.title}" to match "${parsedStep.stepText}". Try adding the following code:\n\n${generateStepCode(parsedScenario.steps, index)}`);
        }
    });

    if (errors.length) {
        throw new Error(errors.join('\n\n'));
    }
};
