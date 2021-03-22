import { Scenario, ScenarioOutline } from '../models';
import { generateStepCode, generateStepFunctionCall } from './step-generation';
import { indent } from './utils';

const scenarioTemplate = (scenarioTitle: string, steps: string, stepKeywords: string[]) => {
    // tslint:disable-next-line:max-line-length
    return `test('${scenarioTitle.replace(/'+/g, `\\'`)}', ({ ${stepKeywords.join(', ')} }) => {\n${indent(steps, 1).slice(0, -1)}\n});`;
};

const getStepKeywords = (scenario: Scenario | ScenarioOutline) => {
    const stepKeywords: string[] = [];

    scenario.steps.forEach((step) => {
        if (stepKeywords.indexOf(step.keyword) === -1) {
            stepKeywords.push(step.keyword);
        }
    });

    return stepKeywords;
};

export const generateScenarioCode = (scenario: Scenario | ScenarioOutline) => {
    const stepsCode = scenario.steps.map((step) => generateStepCode(step));
    const stepKeywords = getStepKeywords(scenario);

    return scenarioTemplate(scenario.title, stepsCode.join('\n\n'), stepKeywords);
};

export const generateScenarioCodeWithSeparateStepFunctions = (scenario: Scenario | ScenarioOutline) => {
    const stepFunctionCode = scenario.steps.map((step) => generateStepCode(step, true));
    const stepFunctionCalls = scenario.steps.map((step) => generateStepFunctionCall(step));
    const stepKeywords = getStepKeywords(scenario);

    // tslint:disable-next-line:max-line-length
    return `${stepFunctionCode.join('\n\n')}\n\n${scenarioTemplate(scenario.title, stepFunctionCalls.join('\n'), stepKeywords)}`;
};
