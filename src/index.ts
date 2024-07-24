import { createDefineFeature } from './feature-definition-creation';
import { createAutoBindSteps } from './automatic-step-binding';

export { loadFeature, loadFeatures, parseFeature } from './parsed-feature-loading';
export { DefineStepFunction } from './feature-definition-creation';
export { Options, ErrorOptions, ScenarioNameTemplateVars, setJestCucumberConfiguration } from './configuration';
export {
  generateCodeFromFeature,
  generateCodeWithSeparateFunctionsFromFeature,
} from './code-generation/generate-code-by-line-number';
export {
  StepsDefinitionCallbackFunction as StepDefinitions,
  StepsDefinitionCallbackFunctionWithContext as StepDefinitionsWithContext,
  IJestLike,
} from './feature-definition-creation';

export const defineFeature = createDefineFeature();
export const autoBindSteps = createAutoBindSteps();
