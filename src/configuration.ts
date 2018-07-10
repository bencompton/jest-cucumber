import { readFileSync, } from 'fs';
import { extname } from 'path';
import { createContext, runInContext } from 'vm';
const { readConfig } = require('jest-config');

import { Options } from "./models";

let globalConfiguration: Options = {};

export const getJestCucumberConfiguration = (options: Options) => {
    return { ...globalConfiguration, ...options };
};

export const setJestCucumberConfiguration = (options: Options) => {
    globalConfiguration = options;
};