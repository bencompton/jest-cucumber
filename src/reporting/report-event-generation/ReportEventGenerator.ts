import { EventEmitter } from 'events';
import { Status, Feature } from 'cucumber';

// tslint:disable-next-line:no-var-requires
const EventDataCollector: any = require('cucumber').formatterHelpers.EventDataCollector;

import { loadScenarioResult } from '../scenario-result-tracking/ScenarioResultFileOperations';
import { FeatureFileEventGenerator } from './FeatureFileEventGenerator';
import { TestCaseEventGenerator } from './TestCaseEventGenerator';

export class ReportEventGenerator {
  public eventBroadcaster: EventEmitter;
  public eventDataCollector: any;
  private featureFileEventGenerator: FeatureFileEventGenerator;
  private testCaseEventGenerator: TestCaseEventGenerator;

  constructor() {
    this.eventBroadcaster = new EventEmitter();
    this.eventDataCollector = new EventDataCollector(this.eventBroadcaster);
    this.featureFileEventGenerator = new FeatureFileEventGenerator(this.eventBroadcaster);
    this.testCaseEventGenerator = new TestCaseEventGenerator(this.eventBroadcaster, this.eventDataCollector);
  }

  public onScenarioComplete(jestTestResult: any) {
    const promises = jestTestResult.testResults.map((testResult: any) => {
      const featureTitle = testResult.ancestorTitles[0];
      const scenarioTitle = testResult.title;

      return loadScenarioResult(featureTitle, scenarioTitle)
        .then((scenarioResult) => {
          return this.featureFileEventGenerator
            .generateEventsFromFeatureFile(scenarioResult.featureFilePath)
            .then(() => {
              this.testCaseEventGenerator.generateTestCasePreparedEvent(scenarioResult);
              this.testCaseEventGenerator.generateTestCaseStepEvents(scenarioResult);
              this.testCaseEventGenerator.generateTestCaseFinishedEvent(scenarioResult, testResult);
            });
        });
    });

    return Promise.all(promises);
  }

  public onTestRunComplete(jestTestResult: any) {
    this.eventBroadcaster.emit('test-run-finished', {
      result: { duration: this.calculateTotalDuration(jestTestResult) },
    });
  }

  private calculateTotalDuration(testResults: any) {
    return (testResults.testResults
      .map((suite: any) => {
        return suite.perfStats.end - suite.perfStats.start;
      }))
      .reduce((totalDuration: number, nextSuiteDuration: number) => {
        return totalDuration + nextSuiteDuration;
      }, 0);
  }
}
