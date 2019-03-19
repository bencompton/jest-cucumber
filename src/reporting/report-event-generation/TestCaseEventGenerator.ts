import { EventEmitter } from 'events';
import { IScenarioResult } from '../scenario-result-tracking/ScenarioResultTracker';
import { Status } from 'cucumber';

export class TestCaseEventGenerator {
  private eventBroadcaster: EventEmitter;
  private eventDataCollector: any;

  constructor(eventBroadcaster: EventEmitter, eventDataCollector: any) {
    this.eventBroadcaster = eventBroadcaster;
    this.eventDataCollector = eventDataCollector;
  }

  public generateTestCasePreparedEvent(scenarioResult: IScenarioResult) {
    const sourceLocation = this.getTestCaseSourceLocation(scenarioResult);
    const pickle = this.getTestCasePickle(scenarioResult);

    this.eventBroadcaster.emit('test-case-prepared', {
      sourceLocation,
      steps: pickle.steps.map((pickleStep: any) => {
        const location = pickleStep.locations[pickleStep.locations.length - 1];
        const line = location.line;

        return {
          sourceLocation: { uri: scenarioResult.featureFilePath, line },
        };
      }),
    });
  }

  public generateTestCaseStepEvents(scenarioResult: IScenarioResult) {
    const pickle = this.getTestCasePickle(scenarioResult);

    pickle.steps.forEach((pickleStep: any, index: number) => {
      const stepResult = scenarioResult.stepResults[index];
      const duration = (stepResult) ? (stepResult.endTime - stepResult.startTime) || 1 :  0;
      const status = stepResult ? stepResult.error ? Status.FAILED : Status.PASSED : Status.SKIPPED;
      const exception = stepResult && stepResult.error ? stepResult.error : undefined;

      this.eventBroadcaster.emit('test-step-finished', {
        index,
        testCase: { sourceLocation: this.getTestCaseSourceLocation(scenarioResult) },
        result: {
          duration,
          status,
          exception,
        },
      });
    });
  }

  public generateTestCaseFinishedEvent(scenarioResult: IScenarioResult, testResult: any) {
    this.eventBroadcaster.emit('test-case-finished', {
      sourceLocation: this.getTestCaseSourceLocation(scenarioResult),
      result: { duration: testResult.duration, status: testResult.status },
    });
  }

  private getTestCaseSourceLocation(scenarioResult: IScenarioResult) {
    return { uri: scenarioResult.featureFilePath, line: scenarioResult.lineNumber };
  }

  private getTestCasePickle(scenarioResult: IScenarioResult) {
    const key = this.eventDataCollector.getTestCaseKey(this.getTestCaseSourceLocation(scenarioResult));

    return this.eventDataCollector.pickleMap[key];
  }
}
