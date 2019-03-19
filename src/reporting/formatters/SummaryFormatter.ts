import { SummaryFormatter as CucumberSummaryFormatter } from 'cucumber';
// tslint:disable-next-line:no-var-requires
const getColorFns = require('cucumber/lib/formatter/get_color_fns').default;

import { ReportEventGenerator } from '../report-event-generation/ReportEventGenerator';
import { FormatterConsoleLogger } from './formatter-loggers/FormatterConsoleLogger';

export class SummaryFormatter {
  constructor(reportEventGenerator: ReportEventGenerator) {
    const formatterLogger = new FormatterConsoleLogger();

    const summaryFormatter = new CucumberSummaryFormatter({
      eventDataCollector: reportEventGenerator.eventDataCollector,
      eventBroadcaster: reportEventGenerator.eventBroadcaster,
      log: formatterLogger.log.bind(formatterLogger),
      colorFns: getColorFns(true),
    });
  }
}
