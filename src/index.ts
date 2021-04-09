export { loadFeature, loadFeatures, parseFeature } from './parsed-feature-loading';
export { DefineStepFunction } from './feature-definition-creation';
export { setJestCucumberConfiguration } from './configuration';
export {
  generateCodeFromFeature,
  generateCodeWithSeparateFunctionsFromFeature,
} from './code-generation/generate-code-by-line-number';
export { StepsDefinitionCallbackFunction as StepDefinitions, IJestLike } from './feature-definition-creation';

import { createDefineFeature, IJestLike } from './feature-definition-creation';
import { createAutoBindSteps } from './automatic-step-binding';

const jestLike: IJestLike = {
  describe,
  test,
};

export const defineFeature = createDefineFeature(jestLike);
export const autoBindSteps = createAutoBindSteps(jestLike);
