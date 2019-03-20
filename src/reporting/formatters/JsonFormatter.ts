import { JsonFormatter as CucumberJsonFormatter } from 'cucumber';

import { ReportEventGenerator } from '../report-event-generation/ReportEventGenerator';
import { FormatterDiskLogger } from './formatter-loggers/FormatterDiskLogger';

export class JsonFormatter {
  constructor(reportEventGenerator: ReportEventGenerator, options: { path: string }) {
    let outputPath = './report.json';

    if (options.path) {
      outputPath = options.path;
    }

    const formatterLogger = new FormatterDiskLogger(outputPath);

    const cucumberJsonFormatter = new CucumberJsonFormatter({
      eventDataCollector: reportEventGenerator.eventDataCollector,
      eventBroadcaster: reportEventGenerator.eventBroadcaster,
      log: formatterLogger.log.bind(formatterLogger),
    });

    reportEventGenerator.eventBroadcaster.addListener('test-run-finished', () => {
      formatterLogger.save();
    });
  }
}
