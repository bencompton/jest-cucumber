import { ParsedScenario, ParsedStep, ParsedScenarioOutline } from "./models";

const scenarioTemplate = (scenarioTitle: string, steps: string) => 
`test('${scenarioTitle}', ({ given, when, then, pending }) => {
    ${steps}
});`;

const stepTemplate = (stepKeyword: string, stepMatcher: string, stepArgumentVariables: string[]) =>
`${stepKeyword}('${stepMatcher}', (${stepArgumentVariables.join(', ')}) => {
        pending();
    });`;

const stepTextArgumentRegex = /( [-+]?[0-9]*\.?[0-9]+|\".+\")/;

const escapeRegexCharacters = (text: string) => {
    return text
        .replace(/\$/g, '\$');
};

const convertStepTextToRegex = (step: ParsedStep) => {
    let stepText = escapeRegexCharacters(step.stepText);

    return `/^${stepText}}$/`;
};

const getStepArguments = (step: ParsedStep) => {
    const stepArgumentVariables: string[] = [];
    const argumentMatches = step.stepText.match(stepTextArgumentRegex);

    if (argumentMatches) {
        argumentMatches.forEach((match, index) => {
            stepArgumentVariables.push(`arg${index}`);
        });
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
        stepMatcher = step.stepText;
    }

    return stepMatcher;
};

export const getStepKeyword = (steps: ParsedStep[], stepPosition: number) => {
    const currentStep = steps[stepPosition];

    const containsConjunction = (keyword: string) => ['but', 'and'].indexOf(keyword) !== -1;

    return steps
        .slice(0, stepPosition)
        .map(step => step.keyword)
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
    let steps: ParsedStep[];
    
    if ((<ParsedScenario>scenario).steps) {
        steps = (<ParsedScenario>scenario).steps;
    } else {
        steps = (<ParsedScenarioOutline>scenario).scenarios[0].steps;
    }

    stepsCode = steps.map((step, index) => generateStepCode(steps, index));

    return scenarioTemplate(scenario.title, stepsCode.join('\n\n\t'));
};