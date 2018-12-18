import { ParsedScenario, ParsedScenarioOutline } from '../models';
import { generateStepCode, generateStepFunctionCall } from './step-generation';
import { indent } from './utils';

const scenarioTemplate = (scenarioTitle: string, steps: string, stepKeywords: string[]) => {
    // tslint:disable-next-line:max-line-length
    return `test('${scenarioTitle.replace(/'+/g, `\\'`)}', ({ ${stepKeywords.join(', ')} }) => {\n${indent(steps, 1).slice(0, -1)}\n});`;
};

const getStepKeywords = (scenario: ParsedScenario | ParsedScenarioOutline) => {
    const stepKeywords: string[] = [];

    scenario.steps.forEach((step) => {
        if (stepKeywords.indexOf(step.keyword) === -1) {
            stepKeywords.push(step.keyword);
        }
    });

    return stepKeywords;
};

export const generateScenarioCode = (scenario: ParsedScenario | ParsedScenarioOutline) => {
    const stepsCode = scenario.steps.map((step, index) => generateStepCode(scenario.steps, index));
    const stepKeywords = getStepKeywords(scenario);

    return scenarioTemplate(scenario.title, stepsCode.join('\n\n'), stepKeywords);
};

export const generateScenarioCodeWithSeparateStepFunctions = (scenario: ParsedScenario | ParsedScenarioOutline) => {
    const stepFunctionCode = scenario.steps.map((step, index) => generateStepCode(scenario.steps, index, true));
    const stepFunctionCalls = scenario.steps.map((step, index) => generateStepFunctionCall(scenario.steps, index));
    const stepKeywords = getStepKeywords(scenario);

    // tslint:disable-next-line:max-line-length
    return `${stepFunctionCode.join('\n\n')}\n\n${scenarioTemplate(scenario.title, stepFunctionCalls.join('\n'), stepKeywords)}`;
};
