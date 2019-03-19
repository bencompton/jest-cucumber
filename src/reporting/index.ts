import { ReportEventGenerator } from './report-event-generation/ReportEventGenerator';
import { ProgressFormatter } from './formatters/ProgressFormatter';

module.exports = class {
  private reportEventGenerator: ReportEventGenerator;

  constructor(globalConfig: any, options: any) {
    this.reportEventGenerator = new ReportEventGenerator();
    const formatter = new ProgressFormatter(this.reportEventGenerator);
  }

  public onTestResult(test: any, results: any) {
    return this.reportEventGenerator.onScenarioComplete(results);
  }

  public onRunComplete(contexts: any, results: any) {
    this.reportEventGenerator.onTestRunComplete(results);
  }
};
