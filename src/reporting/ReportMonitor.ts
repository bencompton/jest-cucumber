import { saveScenarioResult } from './ScenariResultFileOperations';
import { ParsedFeature } from '../models';

export interface IStepResult {
  stepText: string;
  stepArguments: string[];
  startTime: number;
  endTime: number | null;
  error: Error | null;
  lineNumber: number;
}

export interface IScenarioResult {
  featureTitle: string;
  featureFilePath: string;
  scenarioTitle: string;
  stepResults: IStepResult[];
  lineNumber: number;
}

export class ReportMonitor {
  private scenarioResult: IScenarioResult;

  constructor(feature: ParsedFeature, scenarioTitle: string, lineNumber: number) {
    this.scenarioResult = {
      featureTitle: feature.title,
      featureFilePath: feature.path,
      scenarioTitle,
      stepResults: [],
      lineNumber,
    };
  }

  public endScenario() {
    return saveScenarioResult(this.scenarioResult);
  }

  public startStep(stepText: string, stepArguments: string[], lineNumber: number) {
    this.scenarioResult.stepResults.push({
      stepText,
      stepArguments,
      startTime: new Date().getTime(),
      endTime: null,
      error: null,
      lineNumber,
    });
  }

  public endStep() {
    this.scenarioResult.stepResults[this.scenarioResult.stepResults.length - 1].endTime = new Date().getTime();
  }

  public stepError(error: Error) {
    this.scenarioResult.stepResults[this.scenarioResult.stepResults.length - 1].endTime = new Date().getTime();
    this.scenarioResult.stepResults[this.scenarioResult.stepResults.length - 1].error = error;
  }
}
