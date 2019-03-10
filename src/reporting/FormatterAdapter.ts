import { EventEmitter } from 'events';
import { JsonFormatter, Formatter, Status } from 'cucumber';
import { readFile } from 'fs';
// tslint:disable-next-line:no-var-requires
const Gherkin = require('gherkin');

// tslint:disable-next-line:no-var-requires
const EventDataCollector: any = require('cucumber').formatterHelpers.EventDataCollector;

import { loadScenarioResult } from './ScenarioResultFileOperations';
import { IFormatterLogger } from './FormatterLogger';

export class FormatterAdapter {
  private eventBroadcaster: EventEmitter;
  private eventDataCollector: any;
  private formatter: Formatter;

  constructor(formatterLogger: IFormatterLogger) {
    this.eventBroadcaster = new EventEmitter();
    this.eventDataCollector = new EventDataCollector(this.eventBroadcaster);

    this.formatter = new JsonFormatter({
      eventDataCollector: this.eventDataCollector,
      eventBroadcaster: this.eventBroadcaster,
      log: formatterLogger.log.bind(formatterLogger),
    });
  }

  public onScenarioComplete(jestTestResult: any) {
    const promises = jestTestResult.testResults.map((testResult: any) => {
      const featureTitle = testResult.ancestorTitles[0];
      const scenarioTitle = testResult.title;

      return loadScenarioResult(featureTitle, scenarioTitle)
        .then((scenarioResult) => {
          return this
            .generateEventsFromFeatureFile(scenarioResult.featureFilePath)
            .then(() => {
              const sourceLocation = { uri: scenarioResult.featureFilePath, line: scenarioResult.lineNumber };
              const key = this.eventDataCollector.getTestCaseKey(sourceLocation);
              const pickle = this.eventDataCollector.pickleMap[key];

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

              pickle.steps.forEach((pickleStep: any, index: number) => {
                const stepResult = scenarioResult.stepResults[index];
                const duration = (stepResult) ? (stepResult.endTime - stepResult.startTime) || 1 :  0;
                const status = stepResult ? stepResult.error ? Status.FAILED : Status.PASSED : Status.SKIPPED;
                const exception = stepResult && stepResult.error ? stepResult.error : undefined;

                this.eventBroadcaster.emit('test-step-finished', {
                  index,
                  testCase: { sourceLocation: { uri: scenarioResult.featureFilePath, line: scenarioResult.lineNumber }},
                  result: {
                    duration,
                    status,
                    exception,
                  },
                });
              });

              this.eventBroadcaster.emit('test-case-finished', {
                sourceLocation: { uri: scenarioResult.featureFilePath, line: scenarioResult.lineNumber },
                result: { duration: testResult.duration, status: testResult.status },
              });
            });
        });
    });

    return Promise.all(promises);
  }

  public onTestRunComplete() {
    this.eventBroadcaster.emit('test-run-finished');
  }

  private log(logText: string) {
    // tslint:disable-next-line:no-console
    console.log(logText);
  }

  private generateEventsFromFeatureFile(featureFilePath: string) {
    return new Promise((resolve, reject) => {
      readFile(featureFilePath, 'utf8', (error, data) => {
        if (error) {
          reject(error);
        } else {
          resolve(data);
        }
      });
    })
    .then((featureText) => {
      const events = Gherkin.generateEvents(featureText, featureFilePath);

      events.forEach((event: any) => {
        this.eventBroadcaster.emit(event.type, event);

        if (event.type === 'pickle') {
          this.eventBroadcaster.emit('pickle-accepted', {
            type: 'pickle-accepted',
            pickle: event.pickle,
            uri: event.uri,
          });
        }
      });
    });
  }
}
