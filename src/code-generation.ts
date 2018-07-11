import { ParsedScenario, ParsedStep, ParsedScenarioOutline } from './models';

const scenarioTemplate = (scenarioTitle: string, steps: string) =>
`test('${scenarioTitle}', ({ given, when, then, pending }) => {
    ${steps}
});`;

const stepTemplate = (stepKeyword: string, stepMatcher: string, stepArgumentVariables: string[]) =>
`${stepKeyword}(${stepMatcher}, (${stepArgumentVariables.join(', ')}) => {
        pending();
    });`;

const stepTextArgumentRegex = /([-+]?[0-9]*\.?[0-9]+|\"(.+)\"|\"?\<(.*)\>\"?)/g;

const escapeRegexCharacters = (text: string) => {
    return text
        .replace(/\$/g, '\\$')
        .replace(/\(/g, '\\(')
        .replace(/\)/g, '\\)');
};

const convertStepTextToRegex = (step: ParsedStep) => {
    let stepText = escapeRegexCharacters(step.stepText);
    let match: RegExpExecArray | null;

    while (match = stepTextArgumentRegex.exec(stepText)) {
        stepText = stepText.replace(new RegExp(match[1], 'g'), '(.*)');
    }

    return `/^${stepText}$/`;
};

const getStepArguments = (step: ParsedStep) => {
    const stepArgumentVariables: string[] = [];

    let match: RegExpExecArray | null;
    let index: number = 0;

    while (match = stepTextArgumentRegex.exec(step.stepText)) {
        stepArgumentVariables.push(`arg${index}`);
        index++;
    }

    if (step.stepArgument) {
        if (typeof step.stepArgument === 'string') {
            stepArgumentVariables.push('docString');
        } else {
            stepArgumentVariables.push('table');
        }
    }

    return stepArgumentVariables;
};

const getStepMatcher = (step: ParsedStep) => {
    let stepMatcher: string = '';

    if (step.stepText.match(stepTextArgumentRegex)) {
        stepMatcher = convertStepTextToRegex(step);
    } else {
        stepMatcher = `'${step.stepText}'`;
    }

    return stepMatcher;
};

export const getStepKeyword = (steps: ParsedStep[], stepPosition: number) => {
    const currentStep = steps[stepPosition];

    const containsConjunction = (keyword: string) => ['but', 'and'].indexOf(keyword) !== -1;

    return steps
        .slice(0, stepPosition)
        .map((step) => step.keyword)
        .reverse()
        .reduce((previousKeyword, nextKeyword) => {
            if (!containsConjunction(previousKeyword)) {
                return previousKeyword;
            } else {
                return nextKeyword;
            }
        }, currentStep.keyword);
};

export const generateStepCode = (steps: ParsedStep[], stepPosition: number) => {
    const step = steps[stepPosition];

    return stepTemplate(getStepKeyword(steps, stepPosition), getStepMatcher(step), getStepArguments(step));
};

export const generateScenarioCode = (scenario: ParsedScenario | ParsedScenarioOutline) => {
    let stepsCode: string[];

    stepsCode = scenario.steps.map((step, index) => generateStepCode(scenario.steps, index));

    return scenarioTemplate(scenario.title, stepsCode.join('\n\n\t'));
};
