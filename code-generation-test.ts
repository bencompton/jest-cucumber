import { generateCodeFromFeatureByLineNumber } from './src/code-generation/generate-code-from-feature-line';

const featureFilePath = './examples/typescript/specs/features/basic-scenarios.feature';
const code = generateCodeFromFeatureByLineNumber(featureFilePath, 4, false);

console.log(code);