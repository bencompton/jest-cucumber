import { FormatterAdapter } from './FormatterAdapter';

module.exports = class {
  private formatterAdapter: FormatterAdapter;

  constructor(globalConfig: any, options: any) {
    this.formatterAdapter = new FormatterAdapter();
  }

  public onTestResult(test: any, results: any) {
    return this.formatterAdapter.onScenarioComplete(results);
  }

  public onRunComplete(contexts: any, results: any) {
    return this.formatterAdapter.onTestRunComplete();
  }
};
