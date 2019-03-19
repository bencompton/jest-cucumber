import { readFile } from 'fs';
import { EventEmitter } from 'events';
// tslint:disable-next-line:no-var-requires
const Gherkin = require('gherkin');

export class FeatureFileEventGenerator {
  private eventBroadcaster: EventEmitter;
  private processedFeatureFiles: { [key: string]: string };

  constructor(eventBroadcaster: EventEmitter) {
    this.eventBroadcaster = eventBroadcaster;
    this.processedFeatureFiles = {};
  }

  public generateEventsFromFeatureFile(featureFilePath: string) {
    return new Promise((resolve, reject) => {
      if (this.processedFeatureFiles[featureFilePath]) {
        return resolve(this.processedFeatureFiles[featureFilePath]);
      } else {
        readFile(featureFilePath, 'utf8', (error, data) => {
          if (error) {
            reject(error);
          } else {
            this.processedFeatureFiles[featureFilePath] = data;
            resolve(data);
          }
        });
      }
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
