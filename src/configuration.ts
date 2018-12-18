import { Options } from './models';

const defaultErrorSettings = {
    missingScenarioInStepDefinitions: true,
    missingStepInStepDefinitions: true,
    missingScenarioInFeature: true,
    missingStepInFeature: true,
};

const defaultConfiguration: Options = {
    tagFilter: undefined,
    scenarioNameTemplate: undefined,
    errors: defaultErrorSettings,
};

let globalConfiguration: Options = {} as Options;

export const getJestCucumberConfiguration = (options?: Options) => {
    const mergedOptions = { ...defaultConfiguration, ...globalConfiguration, ...options || {} };

    if (mergedOptions.errors === true) {
        mergedOptions.errors = defaultErrorSettings;
    }

    return mergedOptions;
};

export const setJestCucumberConfiguration = (options: Options) => {
    globalConfiguration = options;
};
