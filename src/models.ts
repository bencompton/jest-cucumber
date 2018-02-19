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
};

export type ParsedScenario = {
    title: string;
    steps: ParsedStep[];
    tags: string[];
};

export type ParsedScenarioOutline = {
    title: string;
    tags: string[];
    scenarios: ParsedScenario[];
};

export type ParsedFeature = {
    title: string;
    scenarios: ParsedScenario[];
    scenarioOutlines: ParsedScenarioOutline[];
    options: Options;
};

export type Options = {
    tagFilter?: string[];
    errorOnMissingScenariosAndSteps?: boolean;
};