import { FormatterAdapter } from './FormatterAdapter';
import { FormatterDiskLogger } from './FormatterDiskLogger';

module.exports = class {
  private formatterAdapter: FormatterAdapter;
  private formatterLogger: FormatterDiskLogger;

  constructor(globalConfig: any, options: any) {
    this.formatterLogger = new FormatterDiskLogger('./report.json');
    this.formatterAdapter = new FormatterAdapter(this.formatterLogger);
  }

  public onTestResult(test: any, results: any) {
    return this.formatterAdapter.onScenarioComplete(results);
  }

  public onRunComplete(contexts: any, results: any) {
    this.formatterAdapter.onTestRunComplete();
    this.formatterLogger.save();
  }
};
