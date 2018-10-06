import { ParsedStep } from '../models';
import { indent } from './utils';

const stepTemplate = (stepKeyword: string, stepMatcher: string, stepArgumentVariables: string[]) => {
    return `${stepKeyword}(${stepMatcher}, (${stepArgumentVariables.join(', ')}) => {\n\n});`;
};

const getStepFunctionWrapperName = (stepKeyword: string, stepText: string) => {
    return `${stepKeyword}_${stepText.replace(stepTextArgumentRegex, 'X').replace(/\s/g, '_').replace(/[^A-Za-z0-9_]/g, '')}`;
};

const stepWrapperFunctionTemplate = (
  stepKeyword: string,
  stepText: string,
  stepMatcher: string,
  stepArgumentVariables: string[]
) => {
    return `export const ${getStepFunctionWrapperName(stepKeyword, stepText)} = (${stepKeyword}) => {\n${indent(stepTemplate(stepKeyword, stepMatcher, stepArgumentVariables), 1).slice(0, -1)}\n}`
};

const stepWrapperFunctionCallTemplate = (stepText: string, stepKeyword: string) => {
    return `${getStepFunctionWrapperName(stepKeyword, stepText)}(${stepKeyword})`;
};

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

export const generateStepCode = (steps: ParsedStep[], stepPosition: number, generateWrapperFunction = false) => {
    const step = steps[stepPosition];
    const stepKeyword = getStepKeyword(steps, stepPosition);
    const stepMatcher = getStepMatcher(step);
    const stepArguments = getStepArguments(step);

    if (generateWrapperFunction) {
        return stepWrapperFunctionTemplate(stepKeyword, step.stepText, stepMatcher, stepArguments);
    } else {
        return stepTemplate(stepKeyword, stepMatcher, stepArguments);
    }
};

export const generateStepFunctionCall = (steps: ParsedStep[], stepPosition: number) => {
    const step = steps[stepPosition];
    const stepKeyword = getStepKeyword(steps, stepPosition);

    return stepWrapperFunctionCallTemplate(step.stepText, stepKeyword);
};