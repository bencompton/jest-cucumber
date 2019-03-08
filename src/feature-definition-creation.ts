import { checkThatFeatureFileAndStepDefinitionsHaveSameScenarios } from './validation/scenario-validation';
import {
    ScenarioFromStepDefinitions,
    FeatureFromStepDefinitions,
    StepFromStepDefinitions,
    ParsedFeature, ParsedScenario,
    Options, ParsedScenarioOutline,
} from './models';
import {
    ensureFeatureFileAndStepDefinitionScenarioHaveSameSteps,
    matchSteps,
} from './validation/step-definition-validation';
import { applyTagFilters } from './tag-filtering';
import { ReportMonitor } from './reporting/ReportMonitor';

export type StepsDefinitionCallbackOptions = {
    defineStep: DefineStepFunction;
    given: DefineStepFunction;
    when: DefineStepFunction;
    then: DefineStepFunction;
    and: DefineStepFunction;
    but: DefineStepFunction;
    pending: () => void;
};

export type ScenariosDefinitionCallbackFunction = (defineScenario: DefineScenarioFunctionWithAliases) => void;

export type DefineScenarioFunction = (
    scenarioTitle: string,
    stepsDefinitionCallback: StepsDefinitionCallbackFunction,
) => void;

export type DefineScenarioFunctionWithAliases = DefineScenarioFunction & {
    skip: DefineScenarioFunction;
    only: DefineScenarioFunction;
    concurrent: DefineScenarioFunction;
};

export type StepsDefinitionCallbackFunction = (options: StepsDefinitionCallbackOptions) => void;
export type DefineStepFunction = (stepMatcher: string | RegExp, stepDefinitionCallback: (...args: any[]) => any) => any;

const processScenarioTitleTemplate = (
    scenarioTitle: string,
    parsedFeature: ParsedFeature,
    options: Options,
    parsedScenario: ParsedScenario,
    parsedScenarioOutline: ParsedScenarioOutline,
) => {
    if (options && options.scenarioNameTemplate) {
        try {
            return options && options.scenarioNameTemplate({
                featureTitle: parsedFeature.title,
                scenarioTitle: scenarioTitle.toString(),
                featureTags: parsedFeature.tags,
                scenarioTags: (parsedScenario || parsedScenarioOutline).tags,
            });
        } catch (err) {
            throw new Error(
                // tslint:disable-next-line:max-line-length
                `An error occurred while executing a scenario name template. \nTemplate:\n${options.scenarioNameTemplate}\nError:${err.message}`,
            );
        }
    }

    return scenarioTitle;
};

const checkForPendingSteps = (scenarioFromStepDefinitions: ScenarioFromStepDefinitions) => {
    let scenarioPending = false;

    scenarioFromStepDefinitions.steps.forEach((step) => {
        try {
            if (step.stepFunction.toString().indexOf('pending()') !== -1) {
                const pendingTest = new Function(`
                    let isPending = false;

                    const pending = function () {
                        isPending = true;
                    };

                    (${step.stepFunction})();

                    return isPending;
                `);

                scenarioPending = pendingTest();
            }
        } catch (err) {
            // Ignore
        }
    });

    return scenarioPending;
};

const getTestFunction = (skippedViaTagFilter: boolean, only: boolean, skip: boolean, concurrent: boolean) => {
    if (skip || skippedViaTagFilter) {
        return test.skip;
    } else if (only) {
        return test.only;
    } else if (concurrent) {
        return test.concurrent;
    } else {
        return test;
    }
};

const defineScenario = (
    feature: ParsedFeature,
    scenarioTitle: string,
    scenarioFromStepDefinitions: ScenarioFromStepDefinitions,
    parsedScenario: ParsedScenario,
    only: boolean = false,
    skip: boolean = false,
    concurrent: boolean = false,
) => {
    const testFunction = getTestFunction(parsedScenario.skippedViaTagFilter, only, skip, concurrent);

    testFunction(scenarioTitle, () => {
        const reportMonitor = new ReportMonitor(feature, scenarioTitle, parsedScenario.lineNumber);

        const stepsPromise = scenarioFromStepDefinitions.steps.reduce((promiseChain, nextStep, index) => {
            const stepArgument = parsedScenario.steps[index].stepArgument;
            const step = parsedScenario.steps[index];
            const stepText = step.stepText;

            const matches = matchSteps(
                stepText,
                scenarioFromStepDefinitions.steps[index].stepMatcher,
            );

            let matchArgs: string[] = [];

            if (matches && (matches as RegExpMatchArray).length) {
                matchArgs = (matches as RegExpMatchArray).slice(1);
            }

            const args = [...matchArgs, stepArgument];

            reportMonitor.startStep(stepText, matchArgs, step.lineNumber);

            let stepPromise: Promise<any>;

            try {
                stepPromise = promiseChain.then(() => nextStep.stepFunction(...args));
                reportMonitor.endStep();
            } catch (error) {
                reportMonitor.stepError(error);

                stepPromise = Promise.reject({
                    message: `An error occurred while executing step "${stepText}": ${error.message}`,
                    ...error,
                });
            }

            return stepPromise;
        }, Promise.resolve());

        return stepsPromise.then(() => reportMonitor.endScenario());
    });
};

const createDefineScenarioFunction = (
    featureFromStepDefinitions: FeatureFromStepDefinitions,
    parsedFeature: ParsedFeature,
    only: boolean = false,
    skip: boolean = false,
    concurrent: boolean = false,
) => {
    const defineScenarioFunction: DefineScenarioFunction = (
        scenarioTitle: string,
        stepsDefinitionFunctionCallback: StepsDefinitionCallbackFunction,
    ) => {
        const scenarioFromStepDefinitions: ScenarioFromStepDefinitions = {
            title: scenarioTitle,
            steps: [],
        };

        featureFromStepDefinitions.scenarios.push(scenarioFromStepDefinitions);

        stepsDefinitionFunctionCallback({
            defineStep: createDefineStepFunction(scenarioFromStepDefinitions),
            given: createDefineStepFunction(scenarioFromStepDefinitions),
            when: createDefineStepFunction(scenarioFromStepDefinitions),
            then: createDefineStepFunction(scenarioFromStepDefinitions),
            and: createDefineStepFunction(scenarioFromStepDefinitions),
            but: createDefineStepFunction(scenarioFromStepDefinitions),
            pending: () => {
                // Nothing to do
            },
        });

        const parsedScenario = parsedFeature.scenarios
            .filter((s) => s.title.toLowerCase() === scenarioTitle.toLowerCase())[0];

        const parsedScenarioOutline = parsedFeature.scenarioOutlines
            .filter((s) => s.title.toLowerCase() === scenarioTitle.toLowerCase())[0];

        const options = parsedFeature.options;

        scenarioTitle = processScenarioTitleTemplate(
            scenarioTitle,
            parsedFeature,
            options,
            parsedScenario,
            parsedScenarioOutline,
        );

        ensureFeatureFileAndStepDefinitionScenarioHaveSameSteps(
            options,
            parsedScenario || parsedScenarioOutline,
            scenarioFromStepDefinitions,
        );

        if (checkForPendingSteps(scenarioFromStepDefinitions)) {
            xtest(scenarioTitle, () => {
                // Nothing to do
            }, undefined);
        } else if (parsedScenario) {
            defineScenario(
                parsedFeature,
                scenarioTitle,
                scenarioFromStepDefinitions,
                parsedScenario,
                only,
                skip,
                concurrent,
            );
        } else if (parsedScenarioOutline) {
            parsedScenarioOutline.scenarios.forEach((scenario) => {
                defineScenario(
                    parsedFeature,
                    (scenario.title || scenarioTitle),
                    scenarioFromStepDefinitions,
                    scenario,
                    only,
                    skip,
                    concurrent,
                );
            });
        }
    };

    return defineScenarioFunction;
};

const createDefineScenarioFunctionWithAliases = (
    featureFromStepDefinitions: FeatureFromStepDefinitions,
    parsedFeature: ParsedFeature,
) => {
    const defineScenarioFunctionWithAliases = createDefineScenarioFunction(featureFromStepDefinitions, parsedFeature);

    (defineScenarioFunctionWithAliases as DefineScenarioFunctionWithAliases).only = createDefineScenarioFunction(
        featureFromStepDefinitions,
        parsedFeature,
        true,
    );

    (defineScenarioFunctionWithAliases as DefineScenarioFunctionWithAliases).skip = createDefineScenarioFunction(
        featureFromStepDefinitions,
        parsedFeature,
        false,
        true,
    );

    (defineScenarioFunctionWithAliases as DefineScenarioFunctionWithAliases).concurrent = createDefineScenarioFunction(
        featureFromStepDefinitions,
        parsedFeature,
        false,
        false,
        true,
    );

    return defineScenarioFunctionWithAliases as DefineScenarioFunctionWithAliases;
};

const createDefineStepFunction = (scenarioFromStepDefinitions: ScenarioFromStepDefinitions) => {
    return (stepMatcher: string | RegExp, stepFunction: () => any) => {
        const stepDefinition: StepFromStepDefinitions = {
            stepMatcher,
            stepFunction,
        };

        scenarioFromStepDefinitions.steps.push(stepDefinition);
    };
};

export function defineFeature(
    featureFromFile: ParsedFeature,
    scenariosDefinitionCallback: ScenariosDefinitionCallbackFunction,
) {
    const featureFromDefinedSteps: FeatureFromStepDefinitions = {
        title: featureFromFile.title,
        scenarios: [],
    };

    const parsedFeatureWithTagFiltersApplied = applyTagFilters(featureFromFile);

    if (
        parsedFeatureWithTagFiltersApplied.scenarios.length === 0
            && parsedFeatureWithTagFiltersApplied.scenarioOutlines.length === 0
    ) {
        return;
    }

    describe(featureFromFile.title, () => {
        scenariosDefinitionCallback(
            createDefineScenarioFunctionWithAliases(featureFromDefinedSteps, parsedFeatureWithTagFiltersApplied),
        );

        checkThatFeatureFileAndStepDefinitionsHaveSameScenarios(
            parsedFeatureWithTagFiltersApplied,
            featureFromDefinedSteps,
        );
    });
}
