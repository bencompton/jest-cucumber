import { ReportEventGenerator } from './report-event-generation/ReportEventGenerator';
import { ProgressFormatter } from './formatters/ProgressFormatter';
import { SummaryFormatter } from './formatters/SummaryFormatter';
import { JsonFormatter } from './formatters/JsonFormatter';

module.exports = class {
  private reportEventGenerator: ReportEventGenerator;

  constructor(globalConfig: any, options: any) {
    this.reportEventGenerator = new ReportEventGenerator();

    let formatter = new JsonFormatter(this.reportEventGenerator, options);

    if (options && options.formatter) {
      switch (options.formatter) {
        case 'progress':
          formatter = new ProgressFormatter(this.reportEventGenerator);
          break;
        case 'summary':
          formatter = new SummaryFormatter(this.reportEventGenerator);
          break;
        case 'json':
          formatter = new JsonFormatter(this.reportEventGenerator, options);
          break;
        default:
          throw new Error(`${options.formatter} is not a valid formatter!`);
      }
    }
  }

  public onTestResult(test: any, results: any) {
    return this.reportEventGenerator.onScenarioComplete(results);
  }

  public onRunComplete(contexts: any, results: any) {
    this.reportEventGenerator.onTestRunComplete(results);
  }
};
