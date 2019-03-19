import { JsonFormatter as CucumberJsonFormatter } from 'cucumber';

import { ReportEventGenerator } from '../report-event-generation/ReportEventGenerator';
import { FormatterDiskLogger } from './formatter-loggers/FormatterDiskLogger';

export class JsonFormatter {
  constructor(reportEventGenerator: ReportEventGenerator, outputPath: string = './report.json') {
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
