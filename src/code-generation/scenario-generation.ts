import { ParsedScenario, ParsedScenarioOutline } from '../models';
import { generateStepCode, generateStepFunctionCall } from './step-generation';
import { indent } from './utils';

const scenarioTemplate = (scenarioTitle: string, steps: string) => {
    return `test('${scenarioTitle}', ({ given, when, then }) => {\n${indent(steps, 1).slice(0, -1)}\n});`;
}

export const generateScenarioCode = (scenario: ParsedScenario | ParsedScenarioOutline) => {
    const stepsCode = scenario.steps.map((step, index) => generateStepCode(scenario.steps, index));

    return scenarioTemplate(scenario.title, stepsCode.join('\n\n'));
};

export const generateScenarioCodeWithSeparateStepFunctions = (scenario: ParsedScenario | ParsedScenarioOutline) => {
    const stepFunctionCode = scenario.steps.map((step, index) => generateStepCode(scenario.steps, index, true));
    const stepFunctionCalls = scenario.steps.map((step, index) => generateStepFunctionCall(scenario.steps, index));

    return `${stepFunctionCode.join('\n\n')}\n\n${scenarioTemplate(scenario.title, stepFunctionCalls.join('\n'))}`;
}