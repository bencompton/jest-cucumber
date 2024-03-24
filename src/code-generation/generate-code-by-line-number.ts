import { ParsedFeature, ParsedScenario, ParsedScenarioOutline, ParsedStep } from '../models';
import { generateScenarioCodeWithSeparateStepFunctions, generateScenarioCode } from './scenario-generation';
import { generateStepCode } from './step-generation';

export enum ObjectTypeEnum {
  scenario,
  scenarioOutline,
  step,
}

const findObjectByLineNumber = (
  feature: ParsedFeature,
  lineNumber: number,
): { object: unknown; type: ObjectTypeEnum } | null => {
  let found: unknown = null;
  let type: ObjectTypeEnum = ObjectTypeEnum.scenario;

  feature.scenarioOutlines.forEach(scenarioOutline => {
    if (scenarioOutline.lineNumber === lineNumber) {
      found = scenarioOutline;
      type = ObjectTypeEnum.scenarioOutline;
    }

    scenarioOutline.steps.forEach((step, index) => {
      if (step.lineNumber === lineNumber) {
        found = { steps: scenarioOutline.steps, index };
        type = ObjectTypeEnum.step;
      }
    });
  });

  feature.scenarios.forEach(scenario => {
    if (scenario.lineNumber === lineNumber) {
      found = scenario;
      type = ObjectTypeEnum.scenario;
    }

    scenario.steps.forEach((step, index) => {
      if (step.lineNumber === lineNumber) {
        found = { steps: scenario.steps, index };
        type = ObjectTypeEnum.step;
      }
    });
  });

  return found ? { object: found, type } : null;
};

export const generateCodeFromFeature = (feature: ParsedFeature, lineNumber: number) => {
  const objectAtLine = findObjectByLineNumber(feature, lineNumber);

  if (objectAtLine === null) {
    return null;
  }
  switch (objectAtLine.type) {
    case ObjectTypeEnum.scenario:
    case ObjectTypeEnum.scenarioOutline:
      return generateScenarioCode(objectAtLine.object as ParsedScenario | ParsedScenarioOutline);
    case ObjectTypeEnum.step:
      return generateStepCode(
        (objectAtLine.object as { steps: ParsedStep[] }).steps,
        (objectAtLine.object as { index: number }).index,
        false,
      );
    default:
      return null;
  }
};

export const generateCodeWithSeparateFunctionsFromFeature = (feature: ParsedFeature, lineNumber: number) => {
  const objectAtLine = findObjectByLineNumber(feature, lineNumber);

  if (objectAtLine === null) {
    return null;
  }
  switch (objectAtLine.type) {
    case ObjectTypeEnum.scenario:
    case ObjectTypeEnum.scenarioOutline:
      return generateScenarioCodeWithSeparateStepFunctions(
        objectAtLine.object as ParsedScenario | ParsedScenarioOutline,
      );
    case ObjectTypeEnum.step:
      return generateStepCode(
        (objectAtLine.object as { steps: ParsedStep[] }).steps,
        (objectAtLine.object as { index: number }).index,
        true,
      );
    default:
      return null;
  }
};
