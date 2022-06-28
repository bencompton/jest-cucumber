import { Options } from './configuration';

export type StepFromStepDefinitions = {
    stepMatcher: string | RegExp;
    stepFunction(stepArguments?: any): void | PromiseLike<any>;
};

export type ScenarioFromStepDefinitions = {
    title: string;
    steps: StepFromStepDefinitions[];
};

export type FeatureFromStepDefinitions = {
    title: string;
    scenarios: ScenarioFromStepDefinitions[];
};

export type ParsedStep = {
    keyword: string;
    stepText: string;
    stepArgument: string | {};
    lineNumber: number;
};

export type ParsedScenario = {
    title: string;
    steps: ParsedStep[];
    tags: string[];
    lineNumber: number;
    skippedViaTagFilter: boolean;
};

export type ParsedScenarioOutline = {
    title: string;
    tags: string[];
    scenarios: ParsedScenario[];
    steps: ParsedStep[];
    lineNumber: number;
    skippedViaTagFilter: boolean;
};

export type ParsedFeature = {
    title: string;
    scenarios: ParsedScenario[];
    scenarioOutlines: ParsedScenarioOutline[];
    options: Options;
    tags: string[];
};
