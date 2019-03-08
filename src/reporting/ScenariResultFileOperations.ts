import { writeFile, readFile, existsSync, mkdirSync } from 'fs';
import * as os from 'os';
import * as path from 'path';

import { IScenarioResult } from './ReportMonitor';

const getFilePath = (featureTitle: string, scenarioTitle: string) => {
  return path.join(
    os.tmpdir(),
    'jest-cucumber',
    'reporting',
    encodeURIComponent(`${featureTitle}_${scenarioTitle}`),
  );
};

export const saveScenarioResult = (scenarioResult: IScenarioResult) => {
  const filePath = getFilePath(scenarioResult.featureTitle, scenarioResult.scenarioTitle);

  if (!existsSync(path.dirname(filePath))) {
    mkdirSync(path.dirname(filePath));
  }

  return new Promise((resolve, reject) => {
    writeFile(filePath, JSON.stringify(scenarioResult), (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
};

export const loadScenarioResult = (featureTitle: string, scenarioTitle: string) => {
  const filePath = getFilePath(featureTitle, scenarioTitle);

  return new Promise<string>((resolve, reject) => {
    readFile(filePath, 'utf8', (error, data) => {
      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    });
  })
  .then((scenarioResult: string) => JSON.parse(scenarioResult) as IScenarioResult);
};
