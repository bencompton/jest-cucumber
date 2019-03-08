import { EventEmitter } from 'events';
import { JsonFormatter, Formatter, Status } from 'cucumber';
import { readFile } from 'fs';
// tslint:disable-next-line:no-var-requires
const Gherkin = require('gherkin');

// tslint:disable-next-line:no-var-requires
const EventDataCollector: any = require('cucumber').formatterHelpers.EventDataCollector;

import { loadScenarioResult } from './ScenariResultFileOperations';

export class FormatterAdapter {
  private eventBroadcaster: EventEmitter;
  private formatter: Formatter;
  private logs: string[] = [];

  constructor() {
    this.eventBroadcaster = new EventEmitter();

    this.formatter = new JsonFormatter({
      eventBroadcaster: this.eventBroadcaster,
      eventDataCollector: new EventDataCollector(this.eventBroadcaster),
      log: this.log.bind(this),
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
              this.eventBroadcaster.emit('test-case-prepared', {
                sourceLocation:  { uri: scenarioResult.featureFilePath, line: scenarioResult.lineNumber },
                steps: scenarioResult.stepResults.map((stepResult) => {
                  return {
                    sourceLocation: { uri: scenarioResult.featureFilePath, line: stepResult.lineNumber },
                  };
                }),
              });

              scenarioResult.stepResults.forEach((stepResult, index) => {
                this.eventBroadcaster.emit('test-step-finished', {
                  index,
                  testCase: { sourceLocation: { uri: scenarioResult.featureFilePath, line: stepResult.lineNumber }},
                  result: {
                    duration: stepResult.endTime ? (stepResult.endTime as number) - stepResult.startTime : 0,
                    status: stepResult.error ? Status.FAILED : Status.PASSED,
                    exception: stepResult.error ? stepResult.error : undefined,
                  },
                });
              });

              this.eventBroadcaster.emit('test-case-finished', {
                sourceLocation: { uri: scenarioResult.featureFilePath, line: scenarioResult.lineNumber },
                result: { duration: 1, status: Status.PASSED },
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
    this.logs.push(logText);
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
