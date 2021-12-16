export type Step = {
    keyword: string;
    stepText: string;
    stepArgument: string | {};
    lineNumber: number;
    stepMatcher: string | RegExp;
    stepFunction(stepArguments?: any): void | PromiseLike<any>;
};

export type Scenario = {
    title: string;
    steps: Step[];
    tags: string[];
    lineNumber: number;
    stepDefinitionsAvailable: boolean;
    skippedViaTagFilter: boolean;
};

export type ScenarioOutline = {
    title: string;
    tags: string[];
    scenarios: Scenario[];
    steps: Step[];
    lineNumber: number;
    stepDefinitionsAvailable: boolean;
    skippedViaTagFilter: boolean;
};

export type Rule = {
    title: string;
    scenarios: Scenario[];
    scenarioOutlines: ScenarioOutline[];
    ruleDefinitionAvailable: boolean;
    tags: string[];
};

export type Feature = {
    title: string;
    scenarios: Scenario[];
    scenarioOutlines: ScenarioOutline[];
    tags: string[];
    rules: Rule[];
    options: Options;
};

export type ScenarioNameTemplateVars = {
    featureTitle: string;
    scenarioTitle: string;
    scenarioTags: string[];
    featureTags: string[];
};

export type ErrorOptions = {
    missingScenarioInStepDefinitions: boolean;
    missingStepInStepDefinitions: boolean;
    missingScenarioInFeature: boolean;
    missingStepInFeature: boolean;
};

export type Options = {
    loadRelativePath?: boolean;
    tagFilter?: string;
    collapseRules?: boolean;
    errors?: ErrorOptions | boolean;
    scenarioNameTemplate?: (vars: ScenarioNameTemplateVars) => string;
};
