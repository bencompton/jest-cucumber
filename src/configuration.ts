import { Options } from "./models";

let globalConfiguration: Options = {};

export const getJestCucumberConfiguration = (options: Options) => {
    return { ...globalConfiguration, ...options };
};

export const setJestCucumberConfiguration = (options: Options) => {
    globalConfiguration = options;
};