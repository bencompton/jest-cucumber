import { readFileSync, } from 'fs';
import { extname } from 'path';
import { createContext, runInContext } from 'vm';
const { readConfig } = require('jest-config');

import { Options } from "./models";

export const getJestCucumberConfiguration = (options?: Options) => {
    const root = process.cwd()

    const jestConfigPath = readConfig({}, root).configPath;
    const jestConfigFile = readFileSync(jestConfigPath, 'utf8');
    const jestConfigExtension = extname(jestConfigPath).toLowerCase();

    let jestConfig: any = null;

    if (jestConfigExtension === '.json') {
        jestConfig = JSON.parse(jestConfigFile).jest;
    } else if (jestConfigExtension === '.js') {
        const sandbox = { module: {} };

        createContext(sandbox);
        runInContext(jestConfigFile, sandbox);

        jestConfig = (<any>sandbox.module).exports;
    }

    const jestCucumberConfig = { ...jestConfig.jestCucumber, ...options };

    return jestCucumberConfig;
};