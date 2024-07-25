import type { IJestLike } from './feature-definition-creation';
import { ParsedFeature, ParsedScenario, ParsedScenarioOutline } from './models';

export type ErrorOptions = {
  scenariosMustMatchFeatureFile: boolean;
  stepsMustMatchFeatureFile: boolean;
  allowScenariosNotInFeatureFile: boolean;
};

export type Options = {
  loadRelativePath?: boolean;
  tagFilter?: string;
  errors?: ErrorOptions | boolean;
  scenarioNameTemplate?: (vars: ScenarioNameTemplateVars) => string;
  runner?: IJestLike;
};

export type ScenarioNameTemplateVars = {
  featureTitle: string;
  feature: ParsedFeature;
  scenarioTitle: string;
  scenario: ParsedScenario;
  scenarioTags: string[];
  featureTags: string[];
  scenarioOutline: ParsedScenarioOutline;
};

export const defaultErrorSettings = {
  scenariosMustMatchFeatureFile: true,
  stepsMustMatchFeatureFile: true,
  allowScenariosNotInFeatureFile: false,
};

export const defaultConfiguration: Options = {
  tagFilter: undefined,
  scenarioNameTemplate: undefined,
  errors: defaultErrorSettings,
};

let globalConfiguration: Options = {} as Options;

export const getJestCucumberConfiguration = (options?: Options) => {
  const mergedOptions = { ...defaultConfiguration, ...globalConfiguration, ...(options || {}) };

  if (mergedOptions.errors === true) {
    mergedOptions.errors = defaultErrorSettings;
  }

  return mergedOptions;
};

export const setJestCucumberConfiguration = (options: Options) => {
  globalConfiguration = options;
};
